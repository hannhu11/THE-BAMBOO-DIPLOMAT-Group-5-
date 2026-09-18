# LEGACY REFERENCE — bamboo-diplomat (v0 skeleton)

Đây là **những phần còn giữ lại** từ repo `bamboo-diplomat` cũ, dùng như tham chiếu.

## Vì sao còn giữ

| Thư mục | Mục đích giữ | Lưu ý khi dùng |
|---|---|---|
| `content/` | 4 file JSON (scenarios, stakeholders, cards, black_swan) chứa ý tưởng gameplay ban đầu. | Angrativity phải re-validate theo `../design/../02_GODMODE_DESIGN_SYSTEM.md` và `03_KIEN_TRUC_LOGIC_BACKEND.md`. Đối chiếu quote học thuật thủ công lại với giáo trình. |
| `agents/` | Persona charter (content deity, logic deity, design deity, ...). | Dùng như prompt persona khi cần chia việc — KHÔNG dùng như source of truth kỹ thuật. |
| `docs/` | Vision docs cũ (01_SPEC, 03_LOGIC, 04_DESIGN, ...). | Chỉ đọc để hiểu ý đồ ban đầu. Nếu mâu thuẫn với 6 file MD ở root, root thắng. |
| `scripts/` | `check-secrets.sh`, `preflight.sh`, `backup.sh`, `pre-commit`. | Vẫn dùng được tốt. Nên tiếp tục dùng để bảo vệ repo. |
| `infra/` | Docker Compose, nginx, Caddyfile, oracle-setup. | Tham khảo shape. Stack mới sẽ có Postgres nên phải sửa compose. |
| `backend/engine/` | 3 file logic gốc: `scoring.js`, `reactions.js`, `blackswan.js`. | Ý tưởng math ổn. `blackswan.js` PHẢI viết lại — cấm `new Function`. |
| `backend/tests/` | `engine.spec.js`. | Giữ như baseline test, mở rộng thêm. |
| `AGENTS.md` / `SECURITY.md` / `DO_NOT_PUSH.md` | Governance chung. | Vẫn hiệu lực. |

## Đã CỐ TÌNH KHÔNG lấy

| Thứ | Vì sao bỏ |
|---|---|
| `backend/src/routes/`, `sockets/`, `server.js` | Hội đồng đã đánh giá phải re-implement theo state machine mới. Giữ lại sẽ khiến team copy nhầm. |
| `frontend-dashboard/`, `frontend-player/` | Hard-code business logic, không có UI kit. Đã có mockup thay thế trong `design/mockups/`. |
| `.env.example`, `caddy_data/`, `redis-data/` | Rủi ro secret vector — team mới tự tạo `.env` từ đầu. |
| `backend/scripts/seed.js` | Không tương thích với schema PostgreSQL mới. |
| `.github/workflows/ci.yml`, `Dockerfile` | Pin vào scaffold cũ, viết lại nhẹ hơn với stack mới. |

---

**Nguyên tắc:** khi có xung đột giữa `legacy-reference/` và spec ở root — **root thắng**.
