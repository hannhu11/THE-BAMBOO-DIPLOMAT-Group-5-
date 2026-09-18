# 07 · DATA MODEL — Schema Redis + JSON

## 1. Content JSON (đọc-only ở runtime)

Tất cả nội dung ở `/content` được load 1 lần khi container start.
Hot-reload khi Redis nhận key `content:reload=1` (GM press "Reload content").

### 1.1 `content/scenarios.json`

```jsonc
{
  "version": "1.0.0",
  "scenarios": [
    {
      "id": "sc1",
      "title": "Cáp quang biển và Chủ quyền dữ liệu số",
      "context": "Tuyến cáp biển huyết mạch bị đứt gãy nghiêm trọng...",
      "citation": "C1, C3 — Giáo trình HCM 2021, tr.170–185",
      "options": [
        {
          "id": "A",
          "label": "Tăng tốc số — nhận 100% tài trợ Siêu cường A",
          "reactions": { "west": {...}, "neighbor": {...}, "un": {...}, "vn_people": {...} }
        },
        { "id": "B", "label": "Tự cô lập an toàn", "reactions": {...} },
        { "id": "C", "label": "Ngoại giao Cây tre — đa phương", "reactions": {...} }
      ],
      "wisdom": {
        "quote": "\"Muốn người ta giúp cho thì trước hết phải tự giúp lấy mình\"",
        "source": "Hồ Chí Minh Toàn tập, t.5"
      }
    }
  ]
}
```

### 1.2 `content/stakeholders.json`

```jsonc
{
  "west":      { "name": "Phương Tây & Tư bản Quốc tế", "color": "#3D7EA6", "icon": "🌐" },
  "neighbor":  { "name": "Cường quốc Láng giềng",       "color": "#B23A48", "icon": "🗾" },
  "un":        { "name": "Luật pháp Quốc tế & LHQ",     "color": "#C79B3A", "icon": "⚖️" },
  "vn_people": { "name": "Nhân dân & DN Việt Nam",      "color": "#1E7A5A", "icon": "🇻🇳" }
}
```

### 1.3 `content/cards.json`

```jsonc
{
  "cards": [
    { "id": "anchor",   "name": "Dĩ Bất Biến",       "maxUsesPerGroup": 1 },
    { "id": "alliance", "name": "Cầu Đồng Tồn Dị",   "maxUsesPerGroup": 1 },
    { "id": "veto",     "name": "Chất Vấn Đa Phương","maxUsesPerGame": 1 }
  ]
}
```

### 1.4 `content/black_swan.json`

```jsonc
{
  "events": [
    {
      "id": "bs_semi",
      "title": "Đứt gãy chuỗi cung ứng bán dẫn toàn cầu",
      "banner": "🌪 BLACK SWAN — Bán dẫn dừng xuất khẩu 90 ngày",
      "rules": [
        { "if": "autonomy < 40",  "then": { "economy": -20 } },
        { "if": "autonomy >= 70", "then": { "economy": +10 } }
      ]
    }
  ]
}
```

## 2. Redis Keys (runtime)

Namespace prefix `bd:` để dễ scan/backup.

| Key | Type | TTL | Ý nghĩa |
| --- | --- | --- | --- |
| `bd:session:<gameId>` | HASH | 24h | trạng thái session (currentScenario, status, gm) |
| `bd:token:<jwtId>` | STRING | 2h | reverse-lookup token → groupId:memberId |
| `bd:group:<gid>:state` | HASH | 24h | `{autonomy, economy, prestige, score}` |
| `bd:group:<gid>:cards` | SET | 24h | Danh sách card đã dùng |
| `bd:vote:<gid>:<scid>` | HASH | 24h | `{choice: A|B|C, allIn: 0|1, timestamp}` |
| `bd:reactions:<scid>` | LIST | 24h | Log agent phản ứng để dashboard replay |
| `bd:leaderboard` | ZSET | 24h | member = groupId, score = composite |
| `bd:online` | SET | 60s (renew) | Token online — dùng làm bộ đếm `XX/34` |
| `bd:nonce:<n>` | STRING | 30s | QR nonce để cấp token 1 lần |
| `bd:ratelimit:<ip>` | INCR | 60s | Fastify rate-limit |

## 3. Bảng thành viên (mặc định pre-seed)

7 nhóm × 5 người = 35 slot (dư 1 cho khách). Seed trong `scripts/seed.js`:

```
[
  { groupId: 1, members: [1,2,3,4,5] },
  { groupId: 2, members: [1,2,3,4,5] },
  ...
  { groupId: 7, members: [1,2,3,4,5] }
]
```

Sinh viên nhập `groupId + memberIndex` khi join. Không cần tên thật.

## 4. Log & audit

Log JSON dòng, đưa vào stdout container. Fields:

```
{ ts, level, reqId, event, gid, memberId, scenarioId, choice, ip? }
```

`ip?` chỉ log SHA256 để pseudonymize (chống enum).

## 5. Backup Redis

Snapshot Redis (`BGSAVE`) mỗi 30 phút, dump vào volume `redis-data/`.
Không commit dump lên git (đã có trong `.gitignore`).
