#!/usr/bin/env python3
"""
Cloud SSH Toolkit - Main CLI Application
Complete toolkit for deploying and managing secure SSH servers on cloud platforms
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Optional

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from src.core import (
    CloudProvider,
    ServerConfig,
    SSHKeyManager,
    SecurityConfig,
    LogManager
)
from src.providers import get_provider


def print_banner():
    """Print application banner"""
    banner = """
╔═══════════════════════════════════════════════════════════╗
║           Cloud SSH Toolkit v2.0                          ║
║     Professional SSH Server Management for Cloud          ║
╠═══════════════════════════════════════════════════════════╣
║  Supported Providers: AWS, GCP, Azure,                    ║
║                     DigitalOcean, Vultr, Hetzner          ║
╚═══════════════════════════════════════════════════════════╝
    """
    print(banner)


def cmd_create_server(args):
    """Create a new SSH server"""
    logger = LogManager().logger
    
    print(f"\n🚀 Creating SSH server on {args.provider.upper()}...")
    
    # Get provider
    try:
        provider = get_provider(
            CloudProvider(args.provider),
            api_key=args.api_key,
            secret_key=args.secret_key,
            region=args.region
        )
    except ValueError as e:
        logger.error(str(e))
        return False
    
    # Authenticate
    if not provider.authenticate():
        logger.error("Authentication failed")
        return False
    
    # Generate or use existing SSH key
    key_manager = SSHKeyManager()
    key_name = args.key_name or f"cloud-ssh-{args.provider}"
    
    ssh_key = key_manager.load_key(key_name)
    if not ssh_key:
        print(f"🔑 Generating new SSH key: {key_name}")
        ssh_key = key_manager.generate_key_pair(key_name)
        print(f"✅ Key generated successfully")
        print(f"   Fingerprint: {ssh_key.fingerprint}")
    else:
        print(f"✅ Using existing key: {key_name}")
    
    # Create server configuration
    config = ServerConfig(
        name=args.name,
        provider=CloudProvider(args.provider),
        region=args.region,
        instance_type=args.instance_type,
        image=args.image,
        ssh_key_name=key_name,
        security_groups=[args.security_group] if args.security_group else [],
        tags={'project': 'cloud-ssh-toolkit', 'environment': 'production'},
        storage_size=args.storage_size
    )
    
    print(f"\n📋 Server Configuration:")
    print(f"   Name: {config.name}")
    print(f"   Provider: {config.provider.value}")
    print(f"   Region: {config.region}")
    print(f"   Instance Type: {config.instance_type}")
    print(f"   Storage: {config.storage_size}GB {config.storage_type}")
    
    # Create server
    try:
        print(f"\n⏳ Creating server...")
        server = provider.create_server(config)
        
        print(f"\n✅ Server created successfully!")
        print(f"   ID: {server.id}")
        print(f"   Name: {server.name}")
        print(f"   Status: {server.status.value}")
        print(f"   Public IP: {server.public_ip or 'Pending...'}")
        
        if server.public_ip:
            key_path = str(SSHKeyManager().key_dir / key_name)
            print(f"\n🔗 Connect with:")
            print(f"   ssh -i {key_path} ubuntu@{server.public_ip}")
        
        return True
    except Exception as e:
        logger.error(f"Failed to create server: {e}")
        return False


def cmd_list_servers(args):
    """List all servers"""
    logger = LogManager().logger
    
    print(f"\n📋 Listing servers on {args.provider.upper()}...")
    
    try:
        provider = get_provider(
            CloudProvider(args.provider),
            api_key=args.api_key,
            secret_key=args.secret_key,
            region=args.region
        )
    except ValueError as e:
        logger.error(str(e))
        return False
    
    if not provider.authenticate():
        logger.error("Authentication failed")
        return False
    
    servers = provider.list_servers()
    
    if not servers:
        print("   No servers found")
        return True
    
    print(f"\n   {'ID':<20} {'Name':<25} {'Status':<12} {'Public IP':<18} {'Region':<15}")
    print("   " + "-" * 90)
    
    for server in servers:
        print(f"   {server.id:<20} {server.name:<25} {server.status.value:<12} {server.public_ip or 'N/A':<18} {server.region:<15}")
    
    return True


def cmd_generate_key(args):
    """Generate SSH key pair"""
    key_manager = SSHKeyManager()
    
    print(f"\n🔑 Generating SSH key pair: {args.name}")
    
    try:
        ssh_key = key_manager.generate_key_pair(
            name=args.name,
            key_type=args.type,
            bits=args.bits
        )
        
        print(f"✅ Key generated successfully!")
        print(f"   Name: {ssh_key.name}")
        print(f"   Type: {args.type.upper()}")
        print(f"   Fingerprint: {ssh_key.fingerprint}")
        print(f"   Private Key: {key_manager.key_dir / args.name}")
        print(f"   Public Key: {key_manager.key_dir / f'{args.name}.pub'}")
        
        return True
    except Exception as e:
        LogManager().logger.error(f"Failed to generate key: {e}")
        return False


def cmd_security_config(args):
    """Generate security configurations"""
    print(f"\n🔒 Generating security configurations...")
    
    # SSH Config
    ssh_config = SecurityConfig.generate_ssh_config(
        disable_root=not args.allow_root,
        disable_password=not args.allow_password,
        custom_port=args.port
    )
    
    # Fail2Ban Config
    fail2ban_config = SecurityConfig.generate_fail2ban_config(
        bantime=args.ban_time,
        maxretry=args.max_retry
    )
    
    # UFW Rules
    ufw_rules = SecurityConfig.generate_ufw_rules(
        ssh_port=args.port,
        allow_http=args.allow_http,
        allow_https=args.allow_https
    )
    
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Save configs
    with open(output_dir / "sshd_config", 'w') as f:
        f.write(ssh_config)
    print(f"✅ SSH config saved to: {output_dir / 'sshd_config'}")
    
    with open(output_dir / "fail2ban.conf", 'w') as f:
        f.write(fail2ban_config)
    print(f"✅ Fail2Ban config saved to: {output_dir / 'fail2ban.conf'}")
    
    with open(output_dir / "firewall_rules.sh", 'w') as f:
        f.write("#!/bin/bash\n")
        f.write("\n".join(ufw_rules))
    print(f"✅ Firewall rules saved to: {output_dir / 'firewall_rules.sh'}")
    
    return True


def cmd_info(args):
    """Show toolkit information"""
    print("\nℹ️  Cloud SSH Toolkit Information")
    print("=" * 50)
    print("Version: 2.0.0")
    print("Author: Cloud SSH Toolkit Team")
    print("\nSupported Cloud Providers:")
    print("  • AWS (Amazon Web Services)")
    print("  • GCP (Google Cloud Platform)")
    print("  • Azure (Microsoft Azure)")
    print("  • DigitalOcean")
    print("  • Vultr")
    print("  • Hetzner")
    print("\nFeatures:")
    print("  ✓ Automated SSH key generation")
    print("  ✓ Multi-cloud server deployment")
    print("  ✓ Hardened SSH configuration")
    print("  ✓ Fail2Ban brute force protection")
    print("  ✓ Firewall rule management")
    print("  ✓ Server lifecycle management")
    print("\nDocumentation: See docs/ folder")
    return True


def main():
    parser = argparse.ArgumentParser(
        description="Cloud SSH Toolkit - Deploy and manage secure SSH servers",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Common arguments
    common_parser = argparse.ArgumentParser(add_help=False)
    common_parser.add_argument('--provider', choices=['aws', 'gcp', 'azure', 'digitalocean', 'vultr', 'hetzner'], default='aws', help='Cloud provider')
    common_parser.add_argument('--api-key', help='API key')
    common_parser.add_argument('--secret-key', help='Secret key')
    common_parser.add_argument('--region', default='us-east-1', help='Region')
    
    # Create server command
    create_parser = subparsers.add_parser('create', help='Create a new SSH server', parents=[common_parser])
    create_parser.add_argument('--name', required=True, help='Server name')
    create_parser.add_argument('--instance-type', default='t2.micro', help='Instance type')
    create_parser.add_argument('--image', default='ubuntu-20.04', help='OS image')
    create_parser.add_argument('--key-name', help='SSH key name')
    create_parser.add_argument('--security-group', help='Security group')
    create_parser.add_argument('--storage-size', type=int, default=20, help='Storage size in GB')
    create_parser.set_defaults(func=cmd_create_server)
    
    # List servers command
    list_parser = subparsers.add_parser('list', help='List servers', parents=[common_parser])
    list_parser.set_defaults(func=cmd_list_servers)
    
    # Generate key command
    key_parser = subparsers.add_parser('generate-key', help='Generate SSH key pair')
    key_parser.add_argument('--name', required=True, help='Key name')
    key_parser.add_argument('--type', choices=['ed25519', 'rsa'], default='ed25519', help='Key type')
    key_parser.add_argument('--bits', type=int, default=4096, help='Key bits (for RSA)')
    key_parser.set_defaults(func=cmd_generate_key)
    
    # Security config command
    security_parser = subparsers.add_parser('security-config', help='Generate security configurations')
    security_parser.add_argument('--output-dir', default='./security-configs', help='Output directory')
    security_parser.add_argument('--port', type=int, default=22, help='SSH port')
    security_parser.add_argument('--allow-root', action='store_true', help='Allow root login')
    security_parser.add_argument('--allow-password', action='store_true', help='Allow password auth')
    security_parser.add_argument('--ban-time', type=int, default=3600, help='Fail2Ban ban time')
    security_parser.add_argument('--max-retry', type=int, default=5, help='Fail2Ban max retry')
    security_parser.add_argument('--allow-http', action='store_true', help='Allow HTTP')
    security_parser.add_argument('--allow-https', action='store_true', help='Allow HTTPS')
    security_parser.set_defaults(func=cmd_security_config)
    
    # Info command
    info_parser = subparsers.add_parser('info', help='Show toolkit information')
    info_parser.set_defaults(func=cmd_info)
    
    args = parser.parse_args()
    
    print_banner()
    
    if not args.command:
        parser.print_help()
        return 0
    
    success = args.func(args)
    return 0 if success else 1


if __name__ == '__main__':
    sys.exit(main())
