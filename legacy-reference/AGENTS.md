# AGENTS.md — Chỉ thị chính cho agent runtime

> File này được đọc TRƯỚC TIÊN bởi bất kỳ AI coding agent nào (Claude Code,
> Cursor, Aider, Cline, opencode/Genspark) khi mở dự án này. Nó ràng buộc
> hành vi của agent trong toàn bộ quá trình phát triển & triển khai.

---

## 0. Danh tính dự án

- **Tên:** THE BAMBOO DIPLOMAT — KỶ NGUYÊN ĐA CỰC
- **Môn học:** HCM202 — Tư tưởng Hồ Chí Minh
- **Nhóm:** Nhóm 5 — SE1802 — FALL26
- **Nội dung lý luận:** Giáo trình HCM 2021 (NXB Chính trị Quốc gia Sự thật) — Mục 5.2.3 + 5.3.3
- **Server:** Oracle Cloud VM, 24 GB RAM, 200 GB SSD, Ubuntu 22.04
- **Target người chơi:** 34 sinh viên (7 nhóm × ~5 người), 15 phút thuyết trình

---

## 1. Nguyên tắc tối thượng (không được vi phạm)

1. **KHÔNG BAO GIỜ commit hay push các file bí mật lên GitHub.**
   Danh sách cấm: `*.env`, `*.key`, `*.pem`, `id_rsa*`, `secrets.json`,
   `credentials.json`, `admin-token.txt`, `caddy_data/`, `redis-data/`.
   Trước MỌI lần `git commit`, agent phải chạy `scripts/check-secrets.sh`
   và fail nếu phát hiện pattern nhạy cảm.

2. **Nội dung học thuật là nguồn duy nhất của sự thật (single source of truth).**
   Mọi câu trích Hồ Chí Minh, mọi phương án đáp án tối ưu ("Phương án C" trong
   scenarios) đều phải đối chiếu với `docs/06_ACADEMIC_CITATIONS.md`
   (trang giáo trình chuẩn). Không được sáng tác giả câu trích dẫn.

3. **Đúng skill routing.** Khi agent cần một loại tác vụ, phải load đúng
   skill trong ecosystem (opencode/Genspark):
   - Deck slide → skill `deck-builder`
   - Web doc / báo cáo PDF → skill `build-doc`
   - Xử lý PDF giáo trình → skill `pdf`
   - Xử lý rubric xlsx → skill `xlsx`
   - Thiết kế widget stats → skill `widget-design`
   - Thiết kế frontend HTML → skill `frontend-design`

4. **Bám giới hạn tài nguyên Oracle 24GB/200GB.** Không dùng
   Kubernetes/microservices nặng. Stack tối thiểu: Node + Redis +
   Caddy — chạy trên 1 VM, RSS < 2 GB tổng.

5. **Đa ngôn ngữ nội dung = Tiếng Việt.** UI, log user-facing, nội dung
   scenario — tất cả tiếng Việt có dấu, UTF-8. Code + biến + commit message
   tiếng Anh.

---

## 2. Bộ sub-agent con (mỗi file trong `agents/`)

Runtime coding agent nên uỷ quyền theo phân công sau (mỗi file `agents/*.md`
đóng vai persona chuyên biệt — persona có nhiệm vụ, đầu vào, đầu ra rõ ràng):

| Persona | File | Chịu trách nhiệm |
| --- | --- | --- |
| Thần Nội Dung | `agents/01_content_deity.md` | Viết `content/scenarios.json`, `stakeholders.json`, `black_swan.json` bằng tiếng Việt học thuật |
| Thần Slide | `agents/02_slide_deity.md` | Sinh deck thuyết trình 6 phút — dùng skill `deck-builder` |
| Thần Logic | `agents/03_logic_deity.md` | Viết engine chấm điểm & phản ứng agent — file `backend/src/engine/` |
| Thần Triển Khai | `agents/04_deploy_deity.md` | Docker Compose, Caddy TLS, systemd, backup |
| Thần Thiết Kế | `agents/05_design_deity.md` | UI mobile player + dashboard radar chart |
| Thần Bảo Mật | `agents/06_security_deity.md` | Secret scan, JWT, rate limit, CSP |
| Thần Sáng Tạo | `agents/07_creator_deity.md` | Biến số Thiên Nga Đen, thẻ đặc quyền, cơ chế comeback |
| Ban Cố Vấn | `agents/00_council_charter.md` | Chốt định hướng khi có xung đột giữa các Thần |

Khi được giao task, agent runtime PHẢI xác định thuộc persona nào, load
prompt tương ứng, và chỉ ghi file trong phạm vi persona đó phụ trách.

---

## 3. Chu trình phát triển bắt buộc

Với mỗi task, làm đúng thứ tự sau:

```
① Đọc SPEC        → docs/01_SPEC.md   (biết YÊU CẦU gì)
② Đọc LOGIC       → docs/03_LOGIC.md  (biết CÔNG THỨC tính điểm)
③ Đọc DESIGN      → docs/04_DESIGN.md (biết GIAO DIỆN như nào)
④ Đọc PRINCIPLES  → docs/05_PRINCIPLES.md (biết RÀNG BUỘC bất khả xâm phạm)
⑤ Viết code / nội dung
⑥ Chạy `npm test` (backend) hoặc `scripts/check-secrets.sh` (mọi file)
⑦ Commit vào branch riêng — KHÔNG commit lên main trực tiếp
⑧ Ghi 1 dòng vào docs/CHANGELOG.md
```

---

## 4. Ranh giới an toàn (safety guardrail)

- Cấm gọi API bên ngoài từ server production nếu không có key trong `.env`
  đã whitelist trong `agents/06_security_deity.md`.
- Cấm log full body payload (chứa vote/token) ra stdout — chỉ log request-id + status.
- Cấm mở port ngoài 80/443/22 trên firewall Oracle.
- Cấm dùng `eval()`, `Function()`, `child_process.exec` với input người dùng.
- Rate limit mặc định: 30 req/phút/IP, 6 vote/phút/token.

---

## 5. Định nghĩa "Done"

Một task được coi là hoàn thành khi:
1. Có test hoặc verification bằng chứng (screenshot, curl 200, log JSON).
2. `scripts/check-secrets.sh` pass.
3. `docs/CHANGELOG.md` được cập nhật.
4. Code chạy được với `docker compose up` trên Oracle VM sạch.

Không "hoàn thành ngầm". Không "coi như xong".

---

Ký: Ban Cố Vấn Nhóm 5 · SE1802 · HCM202 · FALL26
