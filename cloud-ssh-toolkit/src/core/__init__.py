"""Core SSH management functionality"""

import asyncio
import json
import logging
import os
import subprocess
import time
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


class CloudProvider(Enum):
    """Supported cloud providers"""
    AWS = "aws"
    GCP = "gcp"
    AZURE = "azure"
    DIGITALOCEAN = "digitalocean"
    VULTR = "vultr"
    HETZNER = "hetzner"
    LOCAL = "local"


class ServerStatus(Enum):
    """Server status enumeration"""
    PENDING = "pending"
    RUNNING = "running"
    STOPPED = "stopped"
    TERMINATED = "terminated"
    ERROR = "error"


@dataclass
class SSHKey:
    """SSH Key pair representation"""
    name: str
    public_key: str
    private_key: str
    fingerprint: str
    created_at: str = field(default_factory=lambda: time.strftime("%Y-%m-%d %H:%M:%S"))
    
    def save_private_key(self, path: str, permissions: int = 0o600) -> None:
        """Save private key to file with secure permissions"""
        key_path = Path(path)
        key_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(key_path, 'w') as f:
            f.write(self.private_key)
        
        os.chmod(key_path, permissions)
        logging.info(f"Private key saved to {path}")
    
    def save_public_key(self, path: str) -> None:
        """Save public key to file"""
        key_path = Path(path)
        key_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(key_path, 'w') as f:
            f.write(self.public_key)
        
        logging.info(f"Public key saved to {path}")


@dataclass
class ServerConfig:
    """Server configuration"""
    name: str
    provider: CloudProvider
    region: str
    instance_type: str
    image: str
    ssh_key_name: str
    security_groups: List[str] = field(default_factory=list)
    tags: Dict[str, str] = field(default_factory=dict)
    storage_size: int = 20  # GB
    storage_type: str = "ssd"
    enable_monitoring: bool = True
    backup_enabled: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'name': self.name,
            'provider': self.provider.value,
            'region': self.region,
            'instance_type': self.instance_type,
            'image': self.image,
            'ssh_key_name': self.ssh_key_name,
            'security_groups': self.security_groups,
            'tags': self.tags,
            'storage_size': self.storage_size,
            'storage_type': self.storage_type,
            'enable_monitoring': self.enable_monitoring,
            'backup_enabled': self.backup_enabled
        }


@dataclass
class ServerInstance:
    """Cloud server instance representation"""
    id: str
    name: str
    provider: CloudProvider
    status: ServerStatus
    public_ip: Optional[str] = None
    private_ip: Optional[str] = None
    region: str = ""
    instance_type: str = ""
    created_at: str = ""
    tags: Dict[str, str] = field(default_factory=dict)
    
    def is_running(self) -> bool:
        """Check if server is running"""
        return self.status == ServerStatus.RUNNING
    
    def get_ssh_command(self, username: str = "ubuntu", key_path: Optional[str] = None) -> str:
        """Generate SSH connection command"""
        if not self.public_ip:
            raise ValueError("Server has no public IP")
        
        cmd = f"ssh -i {key_path} {username}@{self.public_ip}" if key_path else f"ssh {username}@{self.public_ip}"
        return cmd


class SSHKeyManager:
    """Manage SSH keys"""
    
    def __init__(self, key_dir: str = "~/.ssh"):
        self.key_dir = Path(key_dir).expanduser()
        self.key_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_key_pair(self, name: str, key_type: str = "ed25519", bits: int = 4096) -> SSHKey:
        """Generate a new SSH key pair"""
        private_key_path = self.key_dir / name
        public_key_path = self.key_dir / f"{name}.pub"
        
        # Remove existing keys with same name
        if private_key_path.exists():
            private_key_path.unlink()
        if public_key_path.exists():
            public_key_path.unlink()
        
        # Generate key using ssh-keygen
        cmd = ["ssh-keygen", "-t", key_type, "-f", str(private_key_path), "-N", "", "-C", f"{name}@cloud-ssh-toolkit"]
        
        if key_type == "rsa":
            cmd.extend(["-b", str(bits)])
        
        subprocess.run(cmd, check=True, capture_output=True)
        
        # Read generated keys
        with open(private_key_path, 'r') as f:
            private_key = f.read()
        with open(public_key_path, 'r') as f:
            public_key = f.read()
        
        # Get fingerprint
        result = subprocess.run(
            ["ssh-keygen", "-lf", str(public_key_path)],
            capture_output=True,
            text=True,
            check=True
        )
        fingerprint = result.stdout.strip()
        
        return SSHKey(
            name=name,
            public_key=public_key,
            private_key=private_key,
            fingerprint=fingerprint
        )
    
    def load_key(self, name: str) -> Optional[SSHKey]:
        """Load existing SSH key"""
        private_key_path = self.key_dir / name
        public_key_path = self.key_dir / f"{name}.pub"
        
        if not private_key_path.exists() or not public_key_path.exists():
            return None
        
        with open(private_key_path, 'r') as f:
            private_key = f.read()
        with open(public_key_path, 'r') as f:
            public_key = f.read()
        
        result = subprocess.run(
            ["ssh-keygen", "-lf", str(public_key_path)],
            capture_output=True,
            text=True,
            check=True
        )
        fingerprint = result.stdout.strip()
        
        return SSHKey(
            name=name,
            public_key=public_key,
            private_key=private_key,
            fingerprint=fingerprint
        )
    
    def list_keys(self) -> List[str]:
        """List all available SSH keys"""
        keys = []
        for key_file in self.key_dir.glob("*"):
            if key_file.is_file() and not key_file.name.endswith('.pub'):
                keys.append(key_file.name)
        return keys


class SecurityConfig:
    """Security configuration generator"""
    
    @staticmethod
    def generate_ssh_config(
        disable_root: bool = True,
        disable_password: bool = True,
        allowed_users: Optional[List[str]] = None,
        custom_port: int = 22,
        max_auth_tries: int = 3,
        login_grace_time: int = 60
    ) -> str:
        """Generate hardened SSH configuration"""
        config_lines = [
            "# Cloud SSH Toolkit - Hardened SSH Configuration",
            f"Port {custom_port}",
            "Protocol 2",
            "",
            "# Authentication",
            "PubkeyAuthentication yes",
            "PasswordAuthentication no" if disable_password else "PasswordAuthentication yes",
            "PermitRootLogin no" if disable_root else "PermitRootLogin prohibit-password",
            "ChallengeResponseAuthentication no",
            "UsePAM yes",
            "",
            "# Security",
            f"MaxAuthTries {max_auth_tries}",
            f"LoginGraceTime {login_grace_time}s",
            "ClientAliveInterval 300",
            "ClientAliveCountMax 2",
            "X11Forwarding no",
            "PrintMotd no",
            "AcceptEnv LANG LC_*",
            "",
            "# Subsystem",
            "Subsystem sftp /usr/lib/openssh/sftp-server",
            ""
        ]
        
        if allowed_users:
            config_lines.insert(4, f"AllowUsers {' '.join(allowed_users)}")
        
        return "\n".join(config_lines)
    
    @staticmethod
    def generate_fail2ban_config(
        bantime: int = 3600,
        findtime: int = 600,
        maxretry: int = 5,
        enabled_services: List[str] = None
    ) -> str:
        """Generate Fail2Ban configuration"""
        if enabled_services is None:
            enabled_services = ["sshd"]
        
        config = f"""# Cloud SSH Toolkit - Fail2Ban Configuration
[DEFAULT]
bantime = {bantime}
findtime = {findtime}
maxretry = {maxretry}
backend = auto

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = {maxretry}
bantime = {bantime}

[sshd-ddos]
enabled = true
port = ssh
filter = sshd-ddos
logpath = /var/log/auth.log
maxretry = 6
bantime = {bantime * 2}
"""
        
        return config
    
    @staticmethod
    def generate_ufw_rules(
        ssh_port: int = 22,
        allow_http: bool = False,
        allow_https: bool = False,
        additional_ports: Optional[List[int]] = None
    ) -> List[str]:
        """Generate UFW firewall rules"""
        rules = [
            "# Cloud SSH Toolkit - UFW Rules",
            "ufw default deny incoming",
            "ufw default allow outgoing",
            f"ufw allow {ssh_port}/tcp comment 'SSH'",
            "ufw limit {ssh_port}/tcp comment 'SSH rate limiting'"
        ]
        
        if allow_http:
            rules.append("ufw allow 80/tcp comment 'HTTP'")
        
        if allow_https:
            rules.append("ufw allow 443/tcp comment 'HTTPS'")
        
        if additional_ports:
            for port in additional_ports:
                rules.append(f"ufw allow {port}/tcp comment 'Custom port'")
        
        rules.append("ufw --force enable")
        
        return rules


class LogManager:
    """Logging and monitoring utilities"""
    
    def __init__(self, log_file: Optional[str] = None):
        self.log_file = log_file
        self.logger = logging.getLogger("cloud_ssh_toolkit")
        self.logger.setLevel(logging.INFO)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        console_handler.setFormatter(console_format)
        self.logger.addHandler(console_handler)
        
        # File handler
        if log_file:
            file_handler = logging.FileHandler(log_file)
            file_handler.setLevel(logging.DEBUG)
            file_format = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            file_handler.setFormatter(file_format)
            self.logger.addHandler(file_handler)
    
    def info(self, message: str):
        self.logger.info(message)
    
    def error(self, message: str):
        self.logger.error(message)
    
    def warning(self, message: str):
        self.logger.warning(message)
    
    def debug(self, message: str):
        self.logger.debug(message)
