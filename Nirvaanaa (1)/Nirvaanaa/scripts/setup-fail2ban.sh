#!/bin/bash

# Fail2Ban Setup Script for Nirvaanaa
# This script configures Fail2Ban to protect SSH and other services

echo "Setting up Fail2Ban for Nirvaanaa..."

# Install Fail2Ban if not already installed
if ! command -v fail2ban-server &> /dev/null; then
    echo "Installing Fail2Ban..."
    sudo apt-get update
    sudo apt-get install -y fail2ban
fi

# Create local jail configuration
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
# Ban hosts for 1 hour
bantime = 3600
# Number of failures before ban
findtime = 600
maxretry = 5
# Email notifications (optional - configure if needed)
# destemail = admin@mydomain.com
# sendername = Fail2Ban
# action = %(action_mwl)s

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s
maxretry = 3
bantime = 3600

[sshd-ddos]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s
maxretry = 10
EOF

# Restart Fail2Ban
echo "Restarting Fail2Ban..."
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban

# Show status
echo ""
echo "Fail2Ban status:"
sudo fail2ban-client status

echo ""
echo "SSH jail status:"
sudo fail2ban-client status sshd

echo ""
echo "Fail2Ban setup complete!"
echo "SSH protection is now enabled."
echo ""
echo "To check banned IPs: sudo fail2ban-client status sshd"
echo "To unban an IP: sudo fail2ban-client set sshd unbanip <IP_ADDRESS>"
echo "To view logs: sudo tail -f /var/log/fail2ban.log"

