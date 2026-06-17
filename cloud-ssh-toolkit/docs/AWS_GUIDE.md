# AWS Deployment Guide

## Amazon Web Services (AWS) ile SSH Sunucu Kurulumu

### Önkoşullar

1. AWS hesabı
2. AWS CLI kurulu ve yapılandırılmış
3. IAM kullanıcı erişim anahtarları

### AWS CLI Kurulumu

```bash
# Ubuntu/Debian
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Yapılandırma
aws configure
```

### Otomatik Dağıtım

```bash
# AWS için özel script
./scripts/create_aws.sh --region us-east-1 --instance-type t2.micro
```

### Manuel Dağıtım Adımları

#### 1. SSH Anahtarı Oluştur

```bash
aws ec2 create-key-pair \
  --key-name cloud-ssh-toolkit \
  --query 'KeyMaterial' \
  --output text > cloud-ssh-toolkit.pem
  
chmod 400 cloud-ssh-toolkit.pem
```

#### 2. Güvenlik Grubu Oluştur

```bash
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
  --group-name ssh-sg \
  --description "SSH Security Group" \
  --query 'GroupId' \
  --output text)

# SSH portunu aç
aws ec2 authorize-security-group-ingress \
  --group-id $SECURITY_GROUP_ID \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0
```

#### 3. EC2 Instance Başlat

```bash
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --count 1 \
  --instance-type t2.micro \
  --key-name cloud-ssh-toolkit \
  --security-group-ids $SECURITY_GROUP_ID \
  --query 'Instances[0].InstanceId' \
  --output text)
```

#### 4. Public IP Al

```bash
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)
```

#### 5. Kurulum Scriptini Çalıştır

```bash
scp -i cloud-ssh-toolkit.pem scripts/setup_ssh_server.sh ubuntu@$PUBLIC_IP:/tmp/
ssh -i cloud-ssh-toolkit.pem ubuntu@$PUBLIC_IP "sudo /tmp/setup_ssh_server.sh"
```

### Python Manager ile Dağıtım

```bash
python3 cloud_ssh_manager.py deploy --provider aws --auto-confirm
```

### Maliyet Optimizasyonu

- **Spot Instances**: %70'e varan tasarruf
- **Reserved Instances**: Uzun vadeli kullanım için
- **Auto Scaling**: İhtiyaca göre ölçekleme

### Güvenlik En İyi Pratikleri

1. VPC içinde dağıtın
2. Security Group kurallarını sıkılaştırın
3. IAM rolleri kullanın
4. CloudWatch ile izleyin
5. AWS Systems Manager Session Manager alternatifini değerlendirin

### Sorun Giderme

```bash
# Instance durumunu kontrol et
aws ec2 describe-instance-status --instance-ids $INSTANCE_ID

# Sistem loglarını görüntüle
aws ec2 get-console-output --instance-id $INSTANCE_ID

# Bağlantı sorunları için
ssh -vvv -i cloud-ssh-toolkit.pem ubuntu@$PUBLIC_IP
```

---

Devamı `docs/AWS_ADVANCED.md` dosyasında...
