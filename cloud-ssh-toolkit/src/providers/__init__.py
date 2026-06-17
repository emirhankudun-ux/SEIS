"""Cloud provider implementations"""

import json
import logging
import os
import subprocess
import time
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from ..core import (
    CloudProvider,
    ServerConfig,
    ServerInstance,
    ServerStatus,
    SSHKey,
    LogManager
)


class BaseCloudProvider(ABC):
    """Abstract base class for cloud providers"""
    
    def __init__(self, api_key: Optional[str] = None, secret_key: Optional[str] = None, region: str = "us-east-1"):
        self.api_key = api_key or os.getenv(f"{self.get_provider_name().upper()}_API_KEY")
        self.secret_key = secret_key or os.getenv(f"{self.get_provider_name().upper()}_SECRET_KEY")
        self.region = region
        self.logger = LogManager().logger
    
    @abstractmethod
    def get_provider_name(self) -> CloudProvider:
        """Return provider name"""
        pass
    
    @abstractmethod
    def authenticate(self) -> bool:
        """Authenticate with cloud provider"""
        pass
    
    @abstractmethod
    def create_server(self, config: ServerConfig) -> ServerInstance:
        """Create a new server instance"""
        pass
    
    @abstractmethod
    def delete_server(self, instance_id: str) -> bool:
        """Delete a server instance"""
        pass
    
    @abstractmethod
    def list_servers(self) -> List[ServerInstance]:
        """List all server instances"""
        pass
    
    @abstractmethod
    def get_server(self, instance_id: str) -> Optional[ServerInstance]:
        """Get server instance details"""
        pass
    
    @abstractmethod
    def start_server(self, instance_id: str) -> bool:
        """Start a stopped server"""
        pass
    
    @abstractmethod
    def stop_server(self, instance_id: str) -> bool:
        """Stop a running server"""
        pass
    
    @abstractmethod
    def reboot_server(self, instance_id: str) -> bool:
        """Reboot a server"""
        pass
    
    @abstractmethod
    def list_regions(self) -> List[str]:
        """List available regions"""
        pass
    
    @abstractmethod
    def list_instance_types(self, region: Optional[str] = None) -> List[Dict[str, Any]]:
        """List available instance types"""
        pass
    
    @abstractmethod
    def list_images(self, region: Optional[str] = None, image_type: str = "ubuntu") -> List[Dict[str, Any]]:
        """List available images"""
        pass
    
    def wait_for_server_running(self, instance_id: str, timeout: int = 300, poll_interval: int = 10) -> ServerInstance:
        """Wait for server to be in running state"""
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            server = self.get_server(instance_id)
            if server and server.is_running():
                self.logger.info(f"Server {instance_id} is now running")
                return server
            
            self.logger.info(f"Waiting for server {instance_id} to start...")
            time.sleep(poll_interval)
        
        raise TimeoutError(f"Server {instance_id} did not start within {timeout} seconds")


class AWSProvider(BaseCloudProvider):
    """AWS EC2 provider implementation"""
    
    def __init__(self, api_key: Optional[str] = None, secret_key: Optional[str] = None, region: str = "us-east-1"):
        super().__init__(api_key, secret_key, region)
        self.ec2_client = None
    
    def get_provider_name(self) -> CloudProvider:
        return CloudProvider.AWS
    
    def authenticate(self) -> bool:
        """Authenticate with AWS using boto3"""
        try:
            import boto3
            
            self.ec2_client = boto3.client(
                'ec2',
                aws_access_key_id=self.api_key,
                aws_secret_access_key=self.secret_key,
                region_name=self.region
            )
            
            # Test connection
            self.ec2_client.describe_regions()
            self.logger.info("Successfully authenticated with AWS")
            return True
        except ImportError:
            self.logger.error("boto3 not installed. Run: pip install boto3")
            return False
        except Exception as e:
            self.logger.error(f"AWS authentication failed: {e}")
            return False
    
    def create_server(self, config: ServerConfig) -> ServerInstance:
        """Create EC2 instance"""
        if not self.ec2_client:
            raise RuntimeError("Not authenticated with AWS")
        
        try:
            response = self.ec2_client.run_instances(
                ImageId=config.image,
                InstanceType=config.instance_type,
                KeyName=config.ssh_key_name,
                SecurityGroups=config.security_groups,
                MinCount=1,
                MaxCount=1,
                TagSpecifications=[
                    {
                        'ResourceType': 'instance',
                        'Tags': [{'Key': k, 'Value': v} for k, v in config.tags.items()]
                    }
                ],
                BlockDeviceMappings=[
                    {
                        'DeviceName': '/dev/sda1',
                        'Ebs': {
                            'VolumeSize': config.storage_size,
                            'VolumeType': 'gp3' if config.storage_type == 'ssd' else 'standard',
                            'DeleteOnTermination': True
                        }
                    }
                ],
                Monitoring={'Enabled': config.enable_monitoring}
            )
            
            instance = response['Instances'][0]
            instance_id = instance['InstanceId']
            
            self.logger.info(f"Creating EC2 instance: {instance_id}")
            
            # Wait for instance to start
            server = self.wait_for_server_running(instance_id)
            
            return server
        except Exception as e:
            self.logger.error(f"Failed to create EC2 instance: {e}")
            raise
    
    def delete_server(self, instance_id: str) -> bool:
        """Terminate EC2 instance"""
        if not self.ec2_client:
            raise RuntimeError("Not authenticated with AWS")
        
        try:
            self.ec2_client.terminate_instances(InstanceIds=[instance_id])
            self.logger.info(f"Terminating EC2 instance: {instance_id}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to terminate EC2 instance: {e}")
            return False
    
    def list_servers(self) -> List[ServerInstance]:
        """List all EC2 instances"""
        if not self.ec2_client:
            raise RuntimeError("Not authenticated with AWS")
        
        try:
            response = self.ec2_client.describe_instances()
            instances = []
            
            for reservation in response['Reservations']:
                for instance in reservation['Instances']:
                    status_map = {
                        'pending': ServerStatus.PENDING,
                        'running': ServerStatus.RUNNING,
                        'stopping': ServerStatus.STOPPED,
                        'stopped': ServerStatus.STOPPED,
                        'terminated': ServerStatus.TERMINATED
                    }
                    
                    public_ip = instance.get('PublicIpAddress')
                    private_ip = instance.get('PrivateIpAddress')
                    
                    instances.append(ServerInstance(
                        id=instance['InstanceId'],
                        name=instance.get('Tags', [{}])[0].get('Value', instance['InstanceId']),
                        provider=CloudProvider.AWS,
                        status=status_map.get(instance['State']['Name'], ServerStatus.ERROR),
                        public_ip=public_ip,
                        private_ip=private_ip,
                        region=instance['Placement']['AvailabilityZone'][:-1],
                        instance_type=instance['InstanceType'],
                        created_at=instance['LaunchTime'].isoformat(),
                        tags={tag['Key']: tag['Value'] for tag in instance.get('Tags', [])}
                    ))
            
            return instances
        except Exception as e:
            self.logger.error(f"Failed to list EC2 instances: {e}")
            return []
    
    def get_server(self, instance_id: str) -> Optional[ServerInstance]:
        """Get EC2 instance details"""
        if not self.ec2_client:
            raise RuntimeError("Not authenticated with AWS")
        
        try:
            response = self.ec2_client.describe_instances(InstanceIds=[instance_id])
            
            if not response['Reservations']:
                return None
            
            instance = response['Reservations'][0]['Instances'][0]
            status_map = {
                'pending': ServerStatus.PENDING,
                'running': ServerStatus.RUNNING,
                'stopping': ServerStatus.STOPPED,
                'stopped': ServerStatus.STOPPED,
                'terminated': ServerStatus.TERMINATED
            }
            
            return ServerInstance(
                id=instance['InstanceId'],
                name=instance.get('Tags', [{}])[0].get('Value', instance['InstanceId']),
                provider=CloudProvider.AWS,
                status=status_map.get(instance['State']['Name'], ServerStatus.ERROR),
                public_ip=instance.get('PublicIpAddress'),
                private_ip=instance.get('PrivateIpAddress'),
                region=instance['Placement']['AvailabilityZone'][:-1],
                instance_type=instance['InstanceType'],
                created_at=instance['LaunchTime'].isoformat(),
                tags={tag['Key']: tag['Value'] for tag in instance.get('Tags', [])}
            )
        except Exception as e:
            self.logger.error(f"Failed to get EC2 instance: {e}")
            return None
    
    def start_server(self, instance_id: str) -> bool:
        """Start stopped EC2 instance"""
        if not self.ec2_client:
            raise RuntimeError("Not authenticated with AWS")
        
        try:
            self.ec2_client.start_instances(InstanceIds=[instance_id])
            self.logger.info(f"Starting EC2 instance: {instance_id}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to start EC2 instance: {e}")
            return False
    
    def stop_server(self, instance_id: str) -> bool:
        """Stop running EC2 instance"""
        if not self.ec2_client:
            raise RuntimeError("Not authenticated with AWS")
        
        try:
            self.ec2_client.stop_instances(InstanceIds=[instance_id])
            self.logger.info(f"Stopping EC2 instance: {instance_id}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to stop EC2 instance: {e}")
            return False
    
    def reboot_server(self, instance_id: str) -> bool:
        """Reboot EC2 instance"""
        if not self.ec2_client:
            raise RuntimeError("Not authenticated with AWS")
        
        try:
            self.ec2_client.reboot_instances(InstanceIds=[instance_id])
            self.logger.info(f"Rebooting EC2 instance: {instance_id}")
            return True
        except Exception as e:
            self.logger.error(f"Failed to reboot EC2 instance: {e}")
            return False
    
    def list_regions(self) -> List[str]:
        """List AWS regions"""
        if not self.ec2_client:
            raise RuntimeError("Not authenticated with AWS")
        
        try:
            response = self.ec2_client.describe_regions()
            return [region['RegionName'] for region in response['Regions']]
        except Exception as e:
            self.logger.error(f"Failed to list AWS regions: {e}")
            return []
    
    def list_instance_types(self, region: Optional[str] = None) -> List[Dict[str, Any]]:
        """List AWS instance types"""
        # Common instance types for SSH servers
        return [
            {'name': 't2.micro', 'vcpu': 1, 'memory_gb': 1, 'price_per_hour': 0.0116},
            {'name': 't2.small', 'vcpu': 1, 'memory_gb': 2, 'price_per_hour': 0.023},
            {'name': 't3.micro', 'vcpu': 2, 'memory_gb': 1, 'price_per_hour': 0.0104},
            {'name': 't3.small', 'vcpu': 2, 'memory_gb': 2, 'price_per_hour': 0.0208},
        ]
    
    def list_images(self, region: Optional[str] = None, image_type: str = "ubuntu") -> List[Dict[str, Any]]:
        """List AWS AMIs"""
        if not self.ec2_client:
            raise RuntimeError("Not authenticated with AWS")
        
        try:
            # Ubuntu images
            if image_type == "ubuntu":
                response = self.ec2_client.describe_images(
                    Owners=['099720109477'],  # Canonical
                    Filters=[
                        {'Name': 'name', 'Values': ['ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*']},
                        {'Name': 'state', 'Values': ['available']}
                    ]
                )
                
                images = []
                for image in response['Images']:
                    images.append({
                        'id': image['ImageId'],
                        'name': image['Name'],
                        'description': image['Description'],
                        'created': image['CreationDate']
                    })
                
                return sorted(images, key=lambda x: x['created'], reverse=True)[:5]
            
            return []
        except Exception as e:
            self.logger.error(f"Failed to list AWS images: {e}")
            return []


class GCPProvider(BaseCloudProvider):
    """Google Cloud Platform provider implementation"""
    
    def get_provider_name(self) -> CloudProvider:
        return CloudProvider.GCP
    
    def authenticate(self) -> bool:
        """Authenticate with GCP"""
        try:
            from google.cloud import compute_v1
            
            # Check for credentials
            if not os.getenv('GOOGLE_APPLICATION_CREDENTIALS'):
                self.logger.warning("GOOGLE_APPLICATION_CREDENTIALS not set")
                return False
            
            self.logger.info("Successfully authenticated with GCP")
            return True
        except ImportError:
            self.logger.error("google-cloud-compute not installed. Run: pip install google-cloud-compute")
            return False
        except Exception as e:
            self.logger.error(f"GCP authentication failed: {e}")
            return False
    
    def create_server(self, config: ServerConfig) -> ServerInstance:
        """Create GCP instance"""
        # Placeholder implementation
        self.logger.info("GCP server creation - placeholder")
        return ServerInstance(
            id="gcp-placeholder",
            name=config.name,
            provider=CloudProvider.GCP,
            status=ServerStatus.PENDING
        )
    
    def delete_server(self, instance_id: str) -> bool:
        """Delete GCP instance"""
        self.logger.info("GCP server deletion - placeholder")
        return True
    
    def list_servers(self) -> List[ServerInstance]:
        """List GCP instances"""
        self.logger.info("GCP server listing - placeholder")
        return []
    
    def get_server(self, instance_id: str) -> Optional[ServerInstance]:
        """Get GCP instance details"""
        self.logger.info("GCP server get - placeholder")
        return None
    
    def start_server(self, instance_id: str) -> bool:
        """Start GCP instance"""
        self.logger.info("GCP server start - placeholder")
        return True
    
    def stop_server(self, instance_id: str) -> bool:
        """Stop GCP instance"""
        self.logger.info("GCP server stop - placeholder")
        return True
    
    def reboot_server(self, instance_id: str) -> bool:
        """Reboot GCP instance"""
        self.logger.info("GCP server reboot - placeholder")
        return True
    
    def list_regions(self) -> List[str]:
        """List GCP regions"""
        return ["us-central1", "us-east1", "europe-west1", "asia-east1"]
    
    def list_instance_types(self, region: Optional[str] = None) -> List[Dict[str, Any]]:
        """List GCP instance types"""
        return [
            {'name': 'e2-micro', 'vcpu': 2, 'memory_gb': 1, 'price_per_hour': 0.0084},
            {'name': 'e2-small', 'vcpu': 2, 'memory_gb': 2, 'price_per_hour': 0.0168},
            {'name': 'e2-medium', 'vcpu': 2, 'memory_gb': 4, 'price_per_hour': 0.0336},
        ]
    
    def list_images(self, region: Optional[str] = None, image_type: str = "ubuntu") -> List[Dict[str, Any]]:
        """List GCP images"""
        if image_type == "ubuntu":
            return [
                {'id': 'ubuntu-2004-focal-v20230101', 'name': 'Ubuntu 20.04 LTS', 'description': 'Ubuntu 20.04'},
                {'id': 'ubuntu-2204-jammy-v20230101', 'name': 'Ubuntu 22.04 LTS', 'description': 'Ubuntu 22.04'},
            ]
        return []


class AzureProvider(BaseCloudProvider):
    """Microsoft Azure provider implementation"""
    
    def get_provider_name(self) -> CloudProvider:
        return CloudProvider.AZURE
    
    def authenticate(self) -> bool:
        """Authenticate with Azure"""
        try:
            from azure.identity import DefaultAzureCredential
            from azure.mgmt.compute import ComputeManagementClient
            
            credential = DefaultAzureCredential()
            self.logger.info("Successfully authenticated with Azure")
            return True
        except ImportError:
            self.logger.error("azure-identity or azure-mgmt-compute not installed")
            return False
        except Exception as e:
            self.logger.error(f"Azure authentication failed: {e}")
            return False
    
    def create_server(self, config: ServerConfig) -> ServerInstance:
        """Create Azure VM"""
        self.logger.info("Azure VM creation - placeholder")
        return ServerInstance(
            id="azure-placeholder",
            name=config.name,
            provider=CloudProvider.AZURE,
            status=ServerStatus.PENDING
        )
    
    def delete_server(self, instance_id: str) -> bool:
        """Delete Azure VM"""
        self.logger.info("Azure VM deletion - placeholder")
        return True
    
    def list_servers(self) -> List[ServerInstance]:
        """List Azure VMs"""
        self.logger.info("Azure VM listing - placeholder")
        return []
    
    def get_server(self, instance_id: str) -> Optional[ServerInstance]:
        """Get Azure VM details"""
        self.logger.info("Azure VM get - placeholder")
        return None
    
    def start_server(self, instance_id: str) -> bool:
        """Start Azure VM"""
        self.logger.info("Azure VM start - placeholder")
        return True
    
    def stop_server(self, instance_id: str) -> bool:
        """Stop Azure VM"""
        self.logger.info("Azure VM stop - placeholder")
        return True
    
    def reboot_server(self, instance_id: str) -> bool:
        """Reboot Azure VM"""
        self.logger.info("Azure VM reboot - placeholder")
        return True
    
    def list_regions(self) -> List[str]:
        """List Azure regions"""
        return ["eastus", "westus", "westeurope", "southeastasia"]
    
    def list_instance_types(self, region: Optional[str] = None) -> List[Dict[str, Any]]:
        """List Azure instance types"""
        return [
            {'name': 'Standard_B1s', 'vcpu': 1, 'memory_gb': 1, 'price_per_hour': 0.004},
            {'name': 'Standard_B2s', 'vcpu': 2, 'memory_gb': 4, 'price_per_hour': 0.016},
        ]
    
    def list_images(self, region: Optional[str] = None, image_type: str = "ubuntu") -> List[Dict[str, Any]]:
        """List Azure images"""
        if image_type == "ubuntu":
            return [
                {'id': 'Canonical:UbuntuServer:20.04-LTS:latest', 'name': 'Ubuntu 20.04 LTS'},
                {'id': 'Canonical:0001-com-ubuntu-server-jammy:22_04-lts:latest', 'name': 'Ubuntu 22.04 LTS'},
            ]
        return []


# Placeholder implementations for other providers
class DigitalOceanProvider(BaseCloudProvider):
    """DigitalOcean provider implementation"""
    
    def get_provider_name(self) -> CloudProvider:
        return CloudProvider.DIGITALOCEAN
    
    def authenticate(self) -> bool:
        self.logger.info("DigitalOcean auth - placeholder")
        return bool(self.api_key)
    
    def create_server(self, config: ServerConfig) -> ServerInstance:
        return ServerInstance(id="do-placeholder", name=config.name, provider=CloudProvider.DIGITALOCEAN, status=ServerStatus.PENDING)
    
    def delete_server(self, instance_id: str) -> bool:
        return True
    
    def list_servers(self) -> List[ServerInstance]:
        return []
    
    def get_server(self, instance_id: str) -> Optional[ServerInstance]:
        return None
    
    def start_server(self, instance_id: str) -> bool:
        return True
    
    def stop_server(self, instance_id: str) -> bool:
        return True
    
    def reboot_server(self, instance_id: str) -> bool:
        return True
    
    def list_regions(self) -> List[str]:
        return ["nyc1", "nyc3", "sfo3", "lon1", "fra1"]
    
    def list_instance_types(self, region: Optional[str] = None) -> List[Dict[str, Any]]:
        return [
            {'name': 's-1vcpu-1gb', 'vcpu': 1, 'memory_gb': 1, 'price_per_hour': 0.00595},
            {'name': 's-1vcpu-2gb', 'vcpu': 1, 'memory_gb': 2, 'price_per_hour': 0.0119},
        ]
    
    def list_images(self, region: Optional[str] = None, image_type: str = "ubuntu") -> List[Dict[str, Any]]:
        if image_type == "ubuntu":
            return [
                {'id': 'ubuntu-20-04-x64', 'name': 'Ubuntu 20.04 LTS'},
                {'id': 'ubuntu-22-04-x64', 'name': 'Ubuntu 22.04 LTS'},
            ]
        return []


class VultrProvider(BaseCloudProvider):
    """Vultr provider implementation"""
    
    def get_provider_name(self) -> CloudProvider:
        return CloudProvider.VULTR
    
    def authenticate(self) -> bool:
        self.logger.info("Vultr auth - placeholder")
        return bool(self.api_key)
    
    def create_server(self, config: ServerConfig) -> ServerInstance:
        return ServerInstance(id="vultr-placeholder", name=config.name, provider=CloudProvider.VULTR, status=ServerStatus.PENDING)
    
    def delete_server(self, instance_id: str) -> bool:
        return True
    
    def list_servers(self) -> List[ServerInstance]:
        return []
    
    def get_server(self, instance_id: str) -> Optional[ServerInstance]:
        return None
    
    def start_server(self, instance_id: str) -> bool:
        return True
    
    def stop_server(self, instance_id: str) -> bool:
        return True
    
    def reboot_server(self, instance_id: str) -> bool:
        return True
    
    def list_regions(self) -> List[str]:
        return ["ewr", "lax", "ord", "ams", "fra"]
    
    def list_instance_types(self, region: Optional[str] = None) -> List[Dict[str, Any]]:
        return [
            {'name': 'vc2-1c-1gb', 'vcpu': 1, 'memory_gb': 1, 'price_per_hour': 0.005},
            {'name': 'vc2-1c-2gb', 'vcpu': 1, 'memory_gb': 2, 'price_per_hour': 0.01},
        ]
    
    def list_images(self, region: Optional[str] = None, image_type: str = "ubuntu") -> List[Dict[str, Any]]:
        if image_type == "ubuntu":
            return [
                {'id': '167', 'name': 'Ubuntu 20.04 LTS'},
                {'id': '2204', 'name': 'Ubuntu 22.04 LTS'},
            ]
        return []


class HetznerProvider(BaseCloudProvider):
    """Hetzner provider implementation"""
    
    def get_provider_name(self) -> CloudProvider:
        return CloudProvider.HETZNER
    
    def authenticate(self) -> bool:
        self.logger.info("Hetzner auth - placeholder")
        return bool(self.api_key)
    
    def create_server(self, config: ServerConfig) -> ServerInstance:
        return ServerInstance(id="hetzner-placeholder", name=config.name, provider=CloudProvider.HETZNER, status=ServerStatus.PENDING)
    
    def delete_server(self, instance_id: str) -> bool:
        return True
    
    def list_servers(self) -> List[ServerInstance]:
        return []
    
    def get_server(self, instance_id: str) -> Optional[ServerInstance]:
        return None
    
    def start_server(self, instance_id: str) -> bool:
        return True
    
    def stop_server(self, instance_id: str) -> bool:
        return True
    
    def reboot_server(self, instance_id: str) -> bool:
        return True
    
    def list_regions(self) -> List[str]:
        return ["fsn1", "nbg1", "hel1"]
    
    def list_instance_types(self, region: Optional[str] = None) -> List[Dict[str, Any]]:
        return [
            {'name': 'cx11', 'vcpu': 1, 'memory_gb': 2, 'price_per_hour': 0.0045},
            {'name': 'cx21', 'vcpu': 2, 'memory_gb': 4, 'price_per_hour': 0.009},
        ]
    
    def list_images(self, region: Optional[str] = None, image_type: str = "ubuntu") -> List[Dict[str, Any]]:
        if image_type == "ubuntu":
            return [
                {'id': 'ubuntu-20.04', 'name': 'Ubuntu 20.04 LTS'},
                {'id': 'ubuntu-22.04', 'name': 'Ubuntu 22.04 LTS'},
            ]
        return []


def get_provider(provider: CloudProvider, api_key: Optional[str] = None, secret_key: Optional[str] = None, region: str = "us-east-1") -> BaseCloudProvider:
    """Factory function to get provider instance"""
    providers = {
        CloudProvider.AWS: AWSProvider,
        CloudProvider.GCP: GCPProvider,
        CloudProvider.AZURE: AzureProvider,
        CloudProvider.DIGITALOCEAN: DigitalOceanProvider,
        CloudProvider.VULTR: VultrProvider,
        CloudProvider.HETZNER: HetznerProvider,
    }
    
    provider_class = providers.get(provider)
    if not provider_class:
        raise ValueError(f"Unsupported provider: {provider}")
    
    return provider_class(api_key, secret_key, region)
