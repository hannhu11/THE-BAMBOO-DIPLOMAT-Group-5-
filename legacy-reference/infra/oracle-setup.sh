#!/usr/bin/env bash
# infra/oracle-setup.sh — chạy ONCE trên Oracle Ubuntu 22.04
# Usage: sudo bash infra/oracle-setup.sh
set -euo pipefail

echo "[1/8] apt update + upgrade"
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo "[2/8] Cài core packages"
apt-get install -y ca-certificates curl gnupg lsb-release ufw fail2ban logrotate

echo "[3/8] Cài Docker Engine + Compose plugin"
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "[4/8] Tạo user 'bamboo'"
if ! id -u bamboo >/dev/null 2>&1; then
  useradd -m -s /bin/bash bamboo
  usermod -aG docker bamboo
fi

echo "[5/8] Firewall (UFW): chỉ 22/80/443"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "[6/8] fail2ban cho SSH"
systemctl enable --now fail2ban

echo "[7/8] Thư mục app + logrotate"
install -o bamboo -g bamboo -d /opt/bamboo-diplomat
install -o bamboo -g bamboo -d /var/backup/bamboo
cat >/etc/logrotate.d/bamboo <<'EOF'
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  missingok
  notifempty
  copytruncate
}
EOF

echo "[8/8] Done. Hãy: sudo -iu bamboo, cd /opt/bamboo-diplomat, git clone ..."
