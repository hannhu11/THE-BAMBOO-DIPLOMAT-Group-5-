# 08 · API CONTRACT — REST + Socket.io

## 1. REST endpoints

| Method | Path | Auth | Body / Query | Response |
| --- | --- | --- | --- | --- |
| GET  | `/health` | none | — | `{status:"ok", uptime, redis:"ok"}` |
| GET  | `/qr` | none | — | PNG QR (rotating nonce) |
| POST | `/join` | none | `{ nonce, groupId, memberIndex }` | `{ token }` |
| GET  | `/state` | JWT | — | full state snapshot |
| POST | `/vote` | JWT | `{ scenarioId, choice, allIn, cardId? }` | `{ok:true, at}` |
| POST | `/admin/scenario/next` | JWT (role=gm) | `{ scenarioId }` | ok |
| POST | `/admin/scenario/close` | JWT (role=gm) | — | ok |
| POST | `/admin/blackswan` | JWT (role=gm) | `{ eventId }` | ok |
| POST | `/admin/allin/score` | JWT (role=gm) | `{ groupId, stars }` | ok |
| POST | `/admin/reset` | JWT (role=gm) | — | ok |
| GET  | `/admin/report.pdf` | JWT (role=gm) | — | PDF |

All responses: `Content-Type: application/json; charset=utf-8`. Errors:

```json
{ "error": "INVALID_TOKEN", "message": "Token expired", "reqId": "..." }
```

## 2. Socket.io events

Namespace default. Auth qua JWT trong `handshake.auth.token`.

### 2.1 Client → Server

| Event | Payload | Ghi chú |
| --- | --- | --- |
| `vote` | `{scenarioId, choice, allIn, cardId?}` | Server ack `{ok:true}` |
| `heartbeat` | `{}` | Giữ `bd:online` alive |
| `presence` | `{}` | Sinh viên báo online, mỗi 25s |

### 2.2 Server → Client (all)

| Event | Payload | Khi nào emit |
| --- | --- | --- |
| `state:update` | full state snapshot | Khi bất kỳ thay đổi lớn |
| `scenario:start` | `{scenarioId, timerSec}` | GM start scenario |
| `scenario:tick` | `{remainSec}` | 1s/lần |
| `scenario:closed` | `{scenarioId}` | Hết timer |
| `scenario:reveal` | `{perGroup, reactions}` | Sau khi engine tính xong |
| `banner` | `{severity, text, ttlMs}` | Black Swan, thẻ đặc quyền |
| `leaderboard:update` | `top7` | Sau reveal |
| `online:count` | `{n, of:34}` | Định kỳ + on join |

### 2.3 Server → Client (dashboard-only namespace `/gm`)

| Event | Payload |
| --- | --- |
| `admin:agent-feed` | `{agentId, deltaText, gid}` |
| `admin:votes-progress` | `{voted, total}` |

## 3. Payload examples

### 3.1 Full state

```json
{
  "gameId": "game_2026_11_20",
  "status": "scenario_running",
  "currentScenario": "sc2",
  "remainSec": 27,
  "onlineCount": 34,
  "groups": {
    "1": { "state":{"autonomy":62,"economy":71,"prestige":55}, "score":63.1, "cards":["anchor"], "allInUsed":0 },
    ...
  },
  "leaderboard": [ {"gid":3, "score":78.2}, ... ],
  "reactions": []
}
```

### 3.2 Reveal

```json
{
  "scenarioId": "sc1",
  "perGroup": {
    "1": { "delta":{"autonomy":-5,"economy":+20,"prestige":+5}, "newScore": 63.1 }
  },
  "reactions": [
    { "gid":1, "agent":"west", "delta":{"economy":+30}, "text":"Hoan nghênh minh bạch" }
  ],
  "wisdom": { "quote":"Muốn người ta giúp...", "source":"HCM Toàn tập, t.5" }
}
```

## 4. Rate limit chi tiết

| Endpoint | Limit |
| --- | --- |
| `POST /vote` | 6/60s/token |
| `POST /join` | 3/60s/IP |
| Socket `vote` event | 6/60s/token |
| `GET /qr` | 60/60s/IP (dashboard refresh) |

Vượt limit → HTTP 429 + `Retry-After` header.

## 5. Validation schema (backend)

Dùng `zod`:

```ts
const VoteSchema = z.object({
  scenarioId: z.enum(["sc1","sc2","sc3"]),
  choice: z.enum(["A","B","C"]),
  allIn: z.boolean().optional(),
  cardId: z.enum(["anchor","alliance","veto"]).optional()
});
```

Reject → 400 với `errorCode: "VALIDATION_FAILED"`.

## 6. Idempotency

- `POST /vote` idempotent theo `(token, scenarioId)`. Vote thứ 2 đè lên.
- `POST /admin/blackswan` KHÔNG idempotent (log lại nếu press 2 lần) —
  UI dashboard disable button sau click.
