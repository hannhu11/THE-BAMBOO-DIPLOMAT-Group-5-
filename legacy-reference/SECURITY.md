# SECURITY.md — Chính sách bảo mật & danh sách cấm push

> Đọc và ký nhận trước khi push commit đầu tiên lên GitHub.

---

## 1. Danh mục CẤM TUYỆT ĐỐI đưa lên GitHub

| Loại file | Ví dụ | Vì sao cấm |
| --- | --- | --- |
| Biến môi trường | `.env`, `.env.production`, `.env.local` | Chứa JWT_SECRET, REDIS_PASSWORD, ADMIN_TOKEN |
| Private key TLS | `*.pem`, `*.key`, `cert.crt` | Kẻ tấn công có thể mạo danh domain |
| SSH key | `id_rsa`, `id_ed25519`, `authorized_keys` | Truy cập trực tiếp VPS Oracle |
| Credential JSON | `credentials.json`, `service-account*.json` | Đăng nhập cloud API |
| Data runtime | `caddy_data/`, `redis-data/`, `dump.rdb` | Có thể chứa token session |
| Backup DB | `*.sql`, `*.rdb`, `backup-*.tar.gz` | Rò rỉ lịch sử vote |
| Config nội bộ | `admin-token.txt`, `game-master.pass` | Cho phép chiếm quyền game |
| Log production | `*.log` (trừ mẫu placeholder) | Có thể chứa IP, token, header |

Mọi pattern trên đều đã có trong `.gitignore`. **Không được** dùng `git add -f`
để bỏ qua.

---

## 2. File AN TOÀN được commit

- `backend/.env.example` — chỉ chứa placeholder như `JWT_SECRET=change-me-in-production`
- `infra/docker-compose.yml` — dùng `${VAR}` đọc từ `.env` trên server
- `infra/Caddyfile.tmpl` — template có `{$DOMAIN}` sẽ được substitute lúc deploy
- `scripts/check-secrets.sh` — script quét chính nó không chứa secret

---

## 3. Quy trình rotate secret nếu lỡ đưa lên GitHub

Nếu vô tình `git push` một file chứa secret:

```bash
# 1. Ngay lập tức revoke secret đó
#    - JWT_SECRET: đổi trong backend/.env trên VPS + restart container
#    - Redis password: đổi trong redis.conf + restart
#    - Admin token: đổi trong scripts/gen-admin-token.sh + rerun

# 2. Xoá khỏi lịch sử git (chỉ khi repo chưa public quá lâu)
git filter-repo --path backend/.env --invert-paths
git push --force origin main

# 3. Coi secret cũ như đã lộ vĩnh viễn — không tái sử dụng
```

**Tốt hơn hết: đừng để việc này xảy ra.** Chạy pre-commit hook đã có sẵn.

---

## 4. Pre-commit hook (đã cài trong `scripts/pre-commit`)

Trước mỗi commit, hook sẽ quét toàn bộ staged files với các pattern:

- `JWT_SECRET\s*=\s*['\"]?[A-Za-z0-9_\-]{20,}`
- `PRIVATE\s+KEY-----`
- `-----BEGIN\s+(RSA|OPENSSH|EC)\s+PRIVATE`
- `AKIA[0-9A-Z]{16}` (AWS)
- `sk-[A-Za-z0-9]{20,}` (OpenAI/Anthropic)
- IP nội bộ Oracle nếu khớp regex

Nếu phát hiện, commit bị chặn với exit code 1.

Cài đặt:
```bash
cp scripts/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
```

---

## 5. Bảo mật runtime trên Oracle VM

1. **Firewall** (`iptables` / Oracle Security List): chỉ mở 22 (SSH — key-only, đóng password), 80 (Caddy redirect), 443 (HTTPS).
2. **Caddy** tự động xin & rotate cert Let's Encrypt.
3. **Rate limit** ở Fastify: 30 req/phút/IP; ở Socket.io: 6 vote/phút/token.
4. **JWT** ký HS256, hạn 2 giờ (đủ 1 buổi thuyết trình + buffer).
5. **CSP** header nghiêm ngặt: chỉ cho phép `self`, không có `unsafe-inline` cho script.
6. **Redis** bind `127.0.0.1` — không expose ra ngoài container.
7. **Backup** hàng giờ trong session, dump vào `/var/backup/bamboo/` (KHÔNG sync git).

---

## 6. Trách nhiệm

- **Bạn 3 (Tech Lead)** — sở hữu SSH key VPS, giữ `.env` production, không share qua chat/email.
- **Bạn 5 (AI Usage & Compliance)** — kiểm tra CI CI/quét bí mật mỗi PR.
- **Cả 5 thành viên** — không copy secret ra tài liệu thuyết trình.

Ký ngày ___/___/2026: __________________________________
