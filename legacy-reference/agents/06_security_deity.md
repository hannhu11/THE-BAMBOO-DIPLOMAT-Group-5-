# Thần Bảo Mật — Security Deity

## Mục tiêu

Zero secret leak, zero abuse, zero downtime do tấn công đơn giản.

## Trách nhiệm file

- `SECURITY.md`
- `.gitignore`
- `scripts/check-secrets.sh`
- `scripts/pre-commit`
- Middleware bảo mật backend (`backend/src/security/*`).
- Header CSP/HSTS trong Caddyfile.

## Checklist

- [ ] `.env` KHÔNG bao giờ trong git history.
- [ ] Pre-commit hook cài đúng vào `.git/hooks/pre-commit`.
- [ ] CI job `secret-scan` bật.
- [ ] JWT HS256, TTL 2h, secret ≥ 96 char.
- [ ] Rate limit áp lên tất cả POST.
- [ ] CSP không có `unsafe-inline` script.
- [ ] Caddy tự HTTPS, disable HTTP/1.0.
- [ ] Redis bind 127.0.0.1 trong network Docker.
- [ ] Log không chứa full IP (SHA256 truncate).
- [ ] Admin panel path bí mật (không public).

## Regex secret scan tối thiểu

```
JWT_SECRET\s*=\s*['"]?[A-Za-z0-9_\-]{20,}
PRIVATE\s+KEY-----
-----BEGIN\s+(RSA|OPENSSH|EC)\s+PRIVATE
AKIA[0-9A-Z]{16}
sk-[A-Za-z0-9]{20,}
ghp_[A-Za-z0-9]{36}
xoxb-[A-Za-z0-9\-]+
password\s*[:=]\s*['"][^'"]{8,}
```

## Skill

Không có skill Genspark riêng — dùng kiến thức bảo mật web + kiểm bằng
`grep -R` + `git log`.

## Cấm

- ❌ Log full request body.
- ❌ Trả JWT trong URL (dùng cookie httpOnly hoặc Authorization header).
- ❌ Cho phép CORS `*`.
- ❌ Chạy container với root user.
