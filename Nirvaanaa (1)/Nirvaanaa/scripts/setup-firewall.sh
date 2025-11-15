#!/bin/bash

# UFW Firewall Setup Script for Nirvaanaa
# This script configures UFW to only allow ports 22 (SSH), 80 (HTTP), and 443 (HTTPS)

echo "Setting up UFW firewall for Nirvaanaa..."

# Reset UFW to default (optional - uncomment if you want to start fresh)
# sudo ufw --force reset

# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (port 22) - CRITICAL: Do this first or you may lock yourself out!
echo "Allowing SSH (port 22)..."
sudo ufw allow 22/tcp comment 'SSH'

# Allow HTTP (port 80) for Let's Encrypt and HTTP redirects
echo "Allowing HTTP (port 80)..."
sudo ufw allow 80/tcp comment 'HTTP'

# Allow HTTPS (port 443) for secure connections
echo "Allowing HTTPS (port 443)..."
sudo ufw allow 443/tcp comment 'HTTPS'

# Enable UFW
echo "Enabling UFW firewall..."
sudo ufw --force enable

# Show status
echo ""
echo "Firewall status:"
sudo ufw status verbose

echo ""
echo "Firewall setup complete!"
echo "Only ports 22 (SSH), 80 (HTTP), and 443 (HTTPS) are now allowed."
echo ""
echo "To check firewall status: sudo ufw status"
echo "To view firewall logs: sudo tail -f /var/log/ufw.log"

