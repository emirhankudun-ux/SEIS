#!/bin/bash
# Cloud SSH Toolkit - UFW Rules
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw limit {ssh_port}/tcp comment 'SSH rate limiting'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable