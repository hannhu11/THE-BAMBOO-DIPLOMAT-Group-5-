# 02 · SYSTEM — Kiến trúc hệ thống

## 1. Sơ đồ tổng thể

```
                    ┌──────────────────────────┐
                    │  Domain: diplomat.<xyz>  │
                    │        (Cloudflare?)     │
                    └────────────┬─────────────┘
                                 │ 443 TLS
              ┌──────────────────▼──────────────────┐
              │   Caddy Reverse Proxy (auto-cert)   │
              │  - HTTP→HTTPS redirect              │
              │  - CSP, HSTS, rate-limit basic      │
              └──────┬──────────────┬───────────────┘
                     │              │
     ┌───────────────▼─┐   ┌────────▼───────┐
     │ /               │   │ /api  /socket  │
     │ Static frontend │   │ Fastify + Socket.io │
     │ (nginx sidecar) │   │ (Node 20)      │
     └─────────────────┘   └────────┬───────┘
                                    │
                             ┌──────▼──────┐
                             │   Redis 7   │
                             │  (session,  │
                             │  vote store)│
                             └─────────────┘

  All containers on 1 Oracle VM:
    - 4 vCPU / 24GB RAM / 200GB SSD / Ubuntu 22.04
    - Docker Compose 1-command up
    - RSS budget: caddy 80MB + api 350MB + redis 200MB + static 20MB ≈ 700MB
```

## 2. Container list

| Service | Image | Port (internal) | Nhiệm vụ |
| --- | --- | --- | --- |
| `caddy` | `caddy:2-alpine` | 80/443 | TLS, reverse proxy, static |
| `api` | `node:20-alpine` (built) | 3000 | REST + Socket.io + engine |
| `web` | `nginx:alpine` | 8080 | Serve player + dashboard tĩnh |
| `redis` | `redis:7-alpine` | 6379 | Session, vote, leaderboard |

## 3. Luồng dữ liệu chính

### 3.1 Sinh viên quét QR → được cấp token

```
Mobile → GET /join?nonce=<n>
API    → validate nonce (Redis EX 30s)
API    → sign JWT (groupId, memberId, sid) — cookie httpOnly + secure
Mobile → redirect /play  → open WebSocket
```

### 3.2 Chọn A/B/C

```
Mobile → emit("vote", { scenarioId, choice, allIn })
API    → validate JWT, rate-limit token bucket
Engine → applyChoice → tính điểm 3 trục + reaction 4 agent
Engine → publish "state:update"
Dashboard ← receive → update radar + agent feed
```

### 3.3 Game Master đẩy Black Swan

```
Dashboard (admin) → POST /admin/blackswan {eventId}
API    → verify admin JWT (role=gm)
Engine → apply event modifiers → broadcast "state:update" + "banner"
```

## 4. Data flow diagram (bức tranh 1 tình huống)

```
[t=0]   GM press "Start scenario 1"
        API broadcasts "scenario:start" {id, timerSec}
[t=1s]  Mobile shows options; timer đếm ngược
[t=5s]  25 sv đã vote — dashboard "voted: 25/34" (live)
[t=30s] Timer hết. API "voting:closed"
[t=31s] Engine tính điểm → broadcast "scenario:reveal" {perGroup, reactions}
[t=32s] Dashboard hiện animation radar biến đổi + agent-feed log
        "[Agent Phương Tây]: Cảnh báo trừng phạt +12%"
[t=45s] GM press "Next scenario" → lặp lại
```

## 5. Bảo mật cấp kiến trúc

- **TLS bắt buộc:** HTTP redirect 301 → HTTPS. HSTS max-age 15552000.
- **JWT hạn 2h.** Refresh token disable — buổi thuyết trình chỉ cần 1 phiên.
- **Redis bind localhost trong network `bamboo-net`.** Không expose ra ngoài.
- **CSP:** `default-src 'self'; script-src 'self' 'sha256-<hash>'; style-src 'self'`.
- **CORS:** chỉ cho phép origin `diplomat.<domain>`.
- **Rate limit:** `@fastify/rate-limit` — 30 req/phút/IP.
- **Vote nonce:** mỗi vote sinh nonce ngắn (5s) — chống replay.
- **Admin panel** sau path bí mật `/gm-<token>` — chỉ Bạn 3 biết.

## 6. Backup & phục hồi

- Redis `SAVE` mỗi 60s + AOF.
- Cron: `scripts/backup.sh` dump Redis + logs vào `/var/backup/bamboo/`
  mỗi 30 phút.
- Trước buổi thuyết trình: chạy `scripts/seed.js` để reset & seed clean state.
- Nếu VM chết: có DNS failover về IP dự phòng (option), hoặc bật kịch bản
  offline (in giấy — xem `12_RISK_BACKUP.md`).
