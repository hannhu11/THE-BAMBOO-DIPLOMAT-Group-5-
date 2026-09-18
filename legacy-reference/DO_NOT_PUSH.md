# DO NOT PUSH — Danh sách trắng-đen minh bạch

Bạn có thể `git push origin main` an toàn khi và chỉ khi file này ✓ toàn bộ.

## ❌ CẤM PUSH — Không bao giờ commit các file/pattern sau

| # | File / pattern | Vì sao |
| --- | --- | --- |
| 1 | `backend/.env` (và bất kỳ `.env` nào) | Chứa JWT_SECRET, REDIS_PASSWORD, GM_ADMIN_TOKEN |
| 2 | `caddy_data/**` `caddy_config/**` | Chứa private key TLS Let's Encrypt |
| 3 | `redis-data/**` `dump.rdb` `*.aof` | Snapshot Redis có thể chứa token phiên |
| 4 | `*.pem` `*.key` `*.crt` | Bất kỳ chứng chỉ TLS/SSH |
| 5 | `id_rsa` `id_ed25519` `known_hosts` | SSH key VPS Oracle |
| 6 | `credentials.json` `service-account*.json` | Cloud SA key |
| 7 | `admin-token.txt` `game-master.pass` | Token role=gm |
| 8 | `logs/**` `*.log` (trừ `access.log.example`) | Log có thể chứa IP + header |
| 9 | `backup-*.tar.gz` `*.sql` `*.dump` | Backup DB |
| 10 | `uploaded_files/**` `giaotrinh.pdf` | Tài liệu bản quyền không phân phối lại |

## ✅ AN TOÀN đẩy lên GitHub

| # | File | Vì sao an toàn |
| --- | --- | --- |
| 1 | `backend/.env.example` | Chỉ có placeholder `change-me-in-production` |
| 2 | `infra/docker-compose.yml` | Dùng `${VAR}` — không hard-code |
| 3 | `infra/Caddyfile.tmpl` | Có `{$DOMAIN}` — substitute lúc chạy |
| 4 | `scripts/check-secrets.sh` | Regex scanner, không chứa secret |
| 5 | `content/**` | Nội dung học thuật, không nhạy cảm |
| 6 | `docs/**` | Tài liệu công khai |
| 7 | `agents/**` | Persona instructions, không secret |
| 8 | `backend/src/**` | Source code, đọc secret từ ENV |
| 9 | `frontend-*/**` | Static frontend |
| 10 | `.github/workflows/ci.yml` | CI test only, KHÔNG deploy, KHÔNG dùng secret |

## Quy trình push

```bash
# 1. Chạy secret scan (bắt buộc)
bash scripts/check-secrets.sh

# 2. Chạy test backend
cd backend && npm install && npm test && cd ..

# 3. Chạy validate content
node scripts/validate-content.js

# 4. Push
git status
git add -A
git status      # đọc lại lần cuối, chắc chắn không có file trong bảng cấm
git commit -m "..."
git push
```

## Nếu lỡ push secret

Xem `SECURITY.md` §3 — Rotate ngay lập tức, sau đó `git filter-repo` xoá lịch sử.
Coi secret cũ như đã lộ vĩnh viễn.
