#!/usr/bin/env python3
"""
SSH Server Deployment Script for Cloud
Supports: AWS EC2, Google Cloud, Azure
"""

import boto3
import json
import sys
from botocore.exceptions import NoCredentialsError, ClientError

def create_key_pair(ec2_client, key_name="ssh-server-key"):
    """Create SSH key pair for EC2 instance"""
    try:
        # Check if key already exists
        existing_keys = ec2_client.describe_key_pairs(KeyNames=[key_name])
        print(f"✓ Key pair '{key_name}' already exists")
        return key_name
    except ClientError:
        pass
    
    # Create new key pair
    response = ec2_client.create_key_pair(KeyName=key_name)
    
    # Save private key
    with open(f"{key_name}.pem", "w") as f:
        f.write(response['KeyMaterial'])
    
    import os
    os.chmod(f"{key_name}.pem", 0o400)
    
    print(f"✓ Created key pair: {key_name}")
    print(f"✓ Private key saved to: {key_name}.pem")
    return key_name

def create_security_group(ec2_client, group_name="ssh-server-sg"):
    """Create security group with SSH access"""
    try:
        response = ec2_client.describe_security_groups(
            GroupNames=[group_name]
        )
        sg_id = response['SecurityGroups'][0]['GroupId']
        print(f"✓ Security group '{group_name}' already exists: {sg_id}")
        return sg_id
    except ClientError:
        pass
    
    # Create security group
    response = ec2_client.create_security_group(
        GroupName=group_name,
        Description='Security group for SSH server with web access'
    )
    sg_id = response['GroupId']
    
    # Authorize SSH (port 22)
    ec2_client.authorize_security_group_ingress(
        GroupId=sg_id,
        IpPermissions=[
            {
                'IpProtocol': 'tcp',
                'FromPort': 22,
                'ToPort': 22,
                'IpRanges': [{'CidrIp': '0.0.0.0/0'}]
            },
            {
                'IpProtocol': 'tcp',
                'FromPort': 80,
                'ToPort': 80,
                'IpRanges': [{'CidrIp': '0.0.0.0/0'}]
            },
            {
                'IpProtocol': 'tcp',
                'FromPort': 443,
                'ToPort': 443,
                'IpRanges': [{'CidrIp': '0.0.0.0/0'}]
            }
        ]
    )
    
    print(f"✓ Created security group: {sg_id}")
    print("✓ Opened ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)")
    return sg_id

def launch_instance(ec2_client, sg_id, key_name, instance_type="t2.micro"):
    """Launch EC2 instance"""
    # Get latest Amazon Linux 2 AMI
    response = ec2_client.describe_images(
        Owners=['amazon'],
        Filters=[
            {'Name': 'name', 'Values': ['amzn2-ami-hvm-*-x86_64-gp2']},
            {'Name': 'state', 'Values': ['available']}
        ]
    )
    
    ami_id = sorted(response['Images'], 
                   key=lambda x: x['CreationDate'], 
                   reverse=True)[0]['ImageId']
    
    # Launch instance
    response = ec2_client.run_instances(
        ImageId=ami_id,
        InstanceType=instance_type,
        KeyName=key_name,
        SecurityGroupIds=[sg_id],
        MinCount=1,
        MaxCount=1,
        TagSpecifications=[{
            'ResourceType': 'instance',
            'Tags': [{'Key': 'Name', 'Value': 'ssh-server'}]
        }]
    )
    
    instance_id = response['Instances'][0]['InstanceId']
    print(f"✓ Launched instance: {instance_id}")
    
    # Wait for instance to be running
    print("⏳ Waiting for instance to start...")
    waiter = ec2_client.get_waiter('instance_running')
    waiter.wait(InstanceIds=[instance_id])
    
    # Get public IP
    response = ec2_client.describe_instances(InstanceIds=[instance_id])
    public_ip = response['Reservations'][0]['Instances'][0]['PublicIpAddress']
    
    print(f"✓ Instance is running!")
    print(f"✓ Public IP: {public_ip}")
    
    return instance_id, public_ip

def deploy_to_aws():
    """Deploy SSH server to AWS"""
    print("\n=== AWS EC2 Deployment ===\n")
    
    try:
        ec2_client = boto3.client('ec2')
        ec2_resource = boto3.resource('ec2')
    except NoCredentialsError:
        print("❌ AWS credentials not found!")
        print("Please configure AWS credentials:")
        print("  aws configure")
        return None
    
    # Create resources
    key_name = create_key_pair(ec2_client)
    sg_id = create_security_group(ec2_client)
    instance_id, public_ip = launch_instance(ec2_client, sg_id, key_name)
    
    print("\n" + "="*50)
    print("🎉 DEPLOYMENT COMPLETE!")
    print("="*50)
    print(f"\nInstance ID: {instance_id}")
    print(f"Public IP: {public_ip}")
    print(f"SSH Key: {key_name}.pem")
    print(f"\nConnect with:")
    print(f"  ssh -i {key_name}.pem ec2-user@{public_ip}")
    print("="*50 + "\n")
    
    return {
        'provider': 'AWS',
        'instance_id': instance_id,
        'public_ip': public_ip,
        'key_file': f"{key_name}.pem"
    }

def generate_setup_script():
    """Generate setup script for the remote server"""
    script = """#!/bin/bash
# SSH Server Setup Script

# Update system
sudo yum update -y || sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo yum install -y git curl wget htop net-tools vim || \
sudo apt install -y git curl wget htop net-tools vim

# Configure SSH
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Install and configure Fail2Ban
sudo yum install -y fail2ban || sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Configure firewall
sudo yum install -y firewalld || sudo apt install -y ufw
sudo systemctl enable firewalld || sudo ufw --force enable
sudo firewall-cmd --permanent --add-service=ssh || sudo ufw allow ssh
sudo firewall-cmd --permanent --add-service=http || sudo ufw allow http
sudo firewall-cmd --permanent --add-service=https || sudo ufw allow https
sudo firewall-cmd --reload || sudo ufw reload

echo "✓ SSH Server setup complete!"
"""
    return script

if __name__ == "__main__":
    print("\n" + "="*50)
    print("🚀 SSH Server Cloud Deployment")
    print("="*50)
    
    # Generate setup script
    setup_script = generate_setup_script()
    with open("/workspace/setup_ssh_server.sh", "w") as f:
        f.write(setup_script)
    print("✓ Generated setup script: setup_ssh_server.sh")
    
    # Deploy to AWS
    result = deploy_to_aws()
    
    if result:
        # Save deployment info
        with open("/workspace/deployment_info.json", "w") as f:
            json.dump(result, f, indent=2)
        print("✓ Deployment info saved to: deployment_info.json")
