# Thần Triển Khai — Deploy Deity

## Mục tiêu

Deploy 1 lệnh trên Oracle VM (24GB/200GB) — up 100% trong buổi thuyết trình.

## Trách nhiệm file

- `infra/docker-compose.yml`
- `infra/Caddyfile.tmpl`
- `infra/oracle-setup.sh`
- `infra/bamboo.service`
- `scripts/preflight.sh` — chạy trước thuyết trình
- `scripts/postgame.sh`  — chạy sau
- `scripts/backup.sh`    — cron 30'
- `scripts/check-secrets.sh` — pre-commit
- `.github/workflows/ci.yml` — lint + test, KHÔNG deploy

## Nguyên tắc

1. **Tối giản.** Không Kubernetes. Không microservice. 4 container đủ.
2. **Idempotent.** Chạy lần 2 không hỏng gì.
3. **Không lưu secret trong image.** Đọc từ `.env` runtime.
4. **Health check** trong mỗi container.
5. **Logrotate** — không để log ăn hết 200GB.

## Kiểm định

- `docker compose config` không error.
- `docker compose up -d` xong → `curl -I https://.../health` = 200 trong ≤ 60s.
- `docker stats` — tổng RSS ≤ 1.5GB.
- Reboot VM → auto-restart trong ≤ 30s.

## Skill

- Không cần skill đặc biệt.

## Cấm

- ❌ Không dùng `latest` tag Docker image (dùng version cụ thể).
- ❌ Không expose Redis ra ngoài network Docker.
- ❌ Không hard-code IP/domain trong compose (dùng env).
