# 11 · DEPLOY — Oracle Cloud VM (24GB / 200GB)

> Đọc kèm `infra/oracle-setup.sh`.

## 1. Chuẩn bị Oracle VM

- Shape: `VM.Standard.A1.Flex` (Ampere Arm) hoặc `E4.Flex`.
- OS: **Ubuntu 22.04 LTS** (arm64 hoặc amd64 tuỳ shape).
- OCPU: 2–4, RAM: 24GB, Boot volume: 200GB.
- Security List: **mở TCP 22 (chỉ IP nhà), 80, 443**. Đóng tất cả khác.
- Reserved public IP → gán vào VM.

## 2. DNS

- Thêm A record: `diplomat.<ten-mien-cua-ban>` → IP public VPS.
- TTL 300s.
- Đợi propagate (thường 1-5 phút, kiểm tra bằng `dig diplomat.<domain>`).

## 3. Cài Docker & tối thiểu công cụ

```bash
sudo bash infra/oracle-setup.sh
```

Script này:
1. `apt update && apt upgrade -y`
2. Cài Docker + Docker Compose plugin.
3. Cài `ufw`, mở 22/80/443.
4. Tạo user `bamboo` không root.
5. Tạo thư mục `/opt/bamboo-diplomat` với owner `bamboo:bamboo`.
6. Tạo `logrotate` cho container logs.
7. Cài `fail2ban` cho SSH.

## 4. Đưa code lên VM

```bash
# Trên máy local
git clone https://github.com/<user>/bamboo-diplomat.git
cd bamboo-diplomat

# Kiểm tra secret trước khi push
bash scripts/check-secrets.sh || exit 1

# Push
git push origin main

# Trên VPS
ssh bamboo@<ip>
cd /opt/bamboo-diplomat
git clone https://github.com/<user>/bamboo-diplomat.git .
```

## 5. Cấu hình `.env` production (KHÔNG commit)

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Điền:
```
JWT_SECRET=$(openssl rand -hex 48)
REDIS_PASSWORD=$(openssl rand -hex 24)
GM_ADMIN_TOKEN=$(openssl rand -hex 32)
DOMAIN=diplomat.your-domain.com
GAME_ID=hcm202_se1802_fall26
```

`chmod 600 backend/.env`.

## 6. Bật service

```bash
docker compose -f infra/docker-compose.yml up -d --build
docker compose -f infra/docker-compose.yml logs -f caddy   # xem cert Let's Encrypt
```

Kiểm tra:
```bash
curl -I https://diplomat.your-domain.com/health
# HTTP/2 200
```

## 7. Kiểm tra tài nguyên

```bash
docker stats --no-stream
# api        350 MiB / 24 GiB
# redis      200 MiB
# caddy       80 MiB
# web         20 MiB
# Tổng ~ 700 MiB — dư sức
```

## 8. Systemd auto-restart (nếu cần)

`infra/bamboo.service`:
```
[Unit]
Description=Bamboo Diplomat
After=docker.service network-online.target
Wants=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/bamboo-diplomat
ExecStart=/usr/bin/docker compose -f infra/docker-compose.yml up -d
ExecStop=/usr/bin/docker compose -f infra/docker-compose.yml down

[Install]
WantedBy=multi-user.target
```

```bash
sudo cp infra/bamboo.service /etc/systemd/system/
sudo systemctl enable bamboo && sudo systemctl start bamboo
```

## 9. Backup schedule

Cron mỗi 30 phút:
```
*/30 * * * * bamboo /opt/bamboo-diplomat/scripts/backup.sh >/dev/null 2>&1
```

## 10. Rollback

Nếu deploy mới hỏng:
```bash
git checkout <last-good-commit>
docker compose -f infra/docker-compose.yml up -d --build
```

## 11. Trước buổi thuyết trình 30 phút

```bash
bash scripts/preflight.sh
# 1. Reset Redis game state
# 2. Seed content
# 3. Verify /health 5 lần
# 4. Rotate JWT_SECRET & GM_ADMIN_TOKEN (optional)
# 5. In QR code A4 (backup nếu chiếu lỗi)
```

## 12. Sau buổi thuyết trình

```bash
bash scripts/postgame.sh
# 1. Snapshot Redis → /var/backup/bamboo/game_final.rdb
# 2. Xuất PDF báo cáo tham gia
# 3. Xuất chứng nhận top 1
# 4. Down services để tiết kiệm tài nguyên (option)
```
