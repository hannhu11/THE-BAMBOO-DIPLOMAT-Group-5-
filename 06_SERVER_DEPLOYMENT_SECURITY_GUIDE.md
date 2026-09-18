# 06 — HƯỚNG DẪN KẾT NỐI SERVER 2, TRIỂN KHAI & TIÊU CHUẨN AN NINH QUỐC TẾ

> **Dành cho:** AI Coding Agent (Antigravity) và Đội ngũ kỹ thuật trong mọi phiên làm việc (Sessions mới).  
> **Dự án:** THE BAMBOO DIPLOMAT — KỶ NGUYÊN ĐA CỰC  
> **Nguồn chỉ đạo hạ tầng & an ninh duy nhất (Infrastructure & Security Single Source of Truth)**.  
> **Cập nhật:** 2026-09-16  

---

## 📌 PHẦN 1: BẢNG TRA CỨU NHANH KẾT NỐI (QUICK ACCESS REFERENCE)

Khi Antigravity bắt đầu một session mới cho dự án `THE-BAMBOO-DIPLOMAT`, agent **PHẢI** đọc file này trước tiên để hiểu cách kết nối và tương tác với máy chủ được chỉ định.

| Thông số | Giá trị thực tế trên máy Local / VPS | Ghi chú quan trọng |
| :--- | :--- | :--- |
| **Máy chủ chỉ định** | **SERVER 2** (Oracle Cloud Infrastructure — OCI) | Server riêng cho Blockchain, Node & The Bamboo Diplomat |
| **Public IPv4** | `161.118.196.170` | IP tĩnh của VPS Oracle Server 2 |
| **SSH User** | `ubuntu` | User mặc định có quyền `sudo` |
| **Đường dẫn SSH Key (Host)** | `C:\Users\ADMIN\Downloads\Open-claw-2\ssh-key-2026-03-18.key` | **Bí mật tuyệt đối — Không di chuyển, không sửa đổi** |
| **Thư mục chứa SSH Key** | `C:\Users\ADMIN\Downloads\Open-claw-2\` | Thư mục key SSH của Server 2 |
| **Thư mục dự án trên Local** | `C:\Users\ADMIN\Downloads\THE-BAMBOO-DIPLOMAT\THE-BAMBOO-DIPLOMAT` | Workspace mã nguồn chuẩn |
| **Thư mục dự án trên VPS** | `/home/ubuntu/the-bamboo-diplomat` | Nơi chứa Docker Compose & App trên Server 2 |
| **Tình trạng Domain** | **Chưa mua domain** (*"Mua domain để sau"*) | Xem Phần 3 để biết giải pháp Wildcard SSL / Staging |

---

### Lệnh SSH mẫu chuẩn (Chạy từ Windows Host qua PowerShell / CMD)

```powershell
# 1. Kiểm tra kết nối nhanh (One-liner Health Check)
ssh -i "C:\Users\ADMIN\Downloads\Open-claw-2\ssh-key-2026-03-18.key" -o StrictHostKeyChecking=no ubuntu@161.118.196.170 "uptime && free -h && df -h /"

# 2. Xem trạng thái Docker trên Server 2
ssh -i "C:\Users\ADMIN\Downloads\Open-claw-2\ssh-key-2026-03-18.key" -o StrictHostKeyChecking=no ubuntu@161.118.196.170 "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

# 3. Mở phiên SSH tương tác trực tiếp
ssh -i "C:\Users\ADMIN\Downloads\Open-claw-2\ssh-key-2026-03-18.key" -o StrictHostKeyChecking=no ubuntu@161.118.196.170
```

---

## 🏗️ PHẦN 2: HIỆN TRẠNG TÀI NGUYÊN & QUY HOẠCH CỔNG TRÊN SERVER 2

### 2.1 Cấu hình phần cứng máy chủ (OCI Ampere A1 Compute)
- **CPU**: 4 OCPU ARM64 (Ampere Altra Processor @ 3.0 GHz)
- **RAM**: **24 GB DDR4** (Hiện tại đang dùng ~1.1 GB, **còn trống tới 22.2 GB**)
- **Ổ cứng**: **200 GB NVMe SSD** (Hiện tại đang dùng ~20 GB, **còn trống tới 166 GB**)
- **Hệ điều hành**: Ubuntu 22.04 LTS (aarch64 / ARM64)
- **Tình trạng tải**: CPU Load ~0.00 (Hoàn toàn nhàn rỗi, cực kỳ lý tưởng để triển khai stack đầy đủ)

### 2.2 Các dự án hiện hữu trên Server 2 (TRÁNH XUNG ĐỘT)
Trên Server 2 hiện đang chạy 2 cụm ứng dụng:
1. **Smart Keychain / SignSafe**:
   - Container `keychain_api`: Uvicorn FastAPI Backend chạy cổng `8000`.
   - Nginx Reverse Proxy tiếp nhận domain `app.signsafevn.online` qua cổng `80` và `443`.
2. **AegisNode** (Hệ thống AI / Blockchain Node & Vector DB):
   - `aegis_frontend`: Next.js chạy cổng `3001`
   - `aegis_api`: FastAPI chạy cổng `8001`
   - `aegis_worker`: Background Task Processor
   - `aegis_db_pgvector`: PostgreSQL 16 + pgvector chạy cổng nội bộ `5434`
   - `aegis_redis`: Redis 7 chạy cổng nội bộ `6379`

### 2.3 Quy hoạch phân bổ cổng (Port Matrix) cho `THE-BAMBOO-DIPLOMAT`
Để tránh xung đột 100% với các dịch vụ đang chạy, Antigravity **BẮT BUỘC** sử dụng dải cổng sau cho `THE-BAMBOO-DIPLOMAT`:

| Thành phần | Cổng Host dự kiến | Ràng buộc Interface | Mục đích |
| :--- | :--- | :--- | :--- |
| **Bamboo Backend API & WebSocket** | `8088` (hoặc `8090`) | `127.0.0.1:8088` | Fastify + Socket.IO server (chỉ định tuyến qua Nginx) |
| **Player Mobile Web** | `3080` (hoặc Nginx static) | `127.0.0.1:3080` | Giao diện điện thoại người chơi |
| **Public Screen** | `3081` (hoặc Nginx static) | `127.0.0.1:3081` | Màn hình máy chiếu hội trường |
| **Game Master (GM) Console** | `3082` (hoặc Nginx static) | `127.0.0.1:3082` | Bàn điều khiển của quản trò |
| **Bamboo PostgreSQL (DB)** | `5435` | **Chỉ Docker Network** (Không mở port ra Host!) | Bảng lưu trữ Session & Event Ledger bất biến |
| **Bamboo Redis** | `6380` | **Chỉ Docker Network** (Không mở port ra Host!) | Presence, Rate Limit, Distributed Lock, Socket Adapter |

> [!IMPORTANT]
> **Quy tắc cô lập mạng Docker**: PostgreSQL (`5435`) và Redis (`6380`) của Bamboo Diplomat phải được đặt trong bridge network riêng biệt (`bamboo-internal`), **TUYỆT ĐỐI KHÔNG publish cổng `5432` hoặc `6379` ra `0.0.0.0`** để tránh xung đột với AegisNode và ngăn chặn bot quét internet tấn công.

---

## 🌐 PHẦN 3: CHIẾN LƯỢC TRIỂN KHAI KHI CHƯA MUA DOMAIN ("MUA DOMAIN ĐỂ SAU")

Vì hiện tại chưa mua domain riêng cho dự án, Antigravity áp dụng một trong ba chiến lược sau để phát triển, thử nghiệm và preview dự án trực tiếp trên Server 2:

### Chiến lược 1: Wildcard DNS miễn phí với Chứng chỉ SSL Let's Encrypt thật (KHUYÊN DÙNG)
Dịch vụ `nip.io` và `sslip.io` cung cấp DNS wildcard tự động phân giải về bất kỳ IP nào hoàn toàn miễn phí mà không cần đăng ký hay mua tên miền.
- **Tên miền tự động trỏ về Server 2**:
  - `bamboo.161.118.196.170.nip.io`
  - `player.161.118.196.170.nip.io`
  - `gm.161.118.196.170.nip.io`
  - Hoặc: `bamboo.161.118.196.170.sslip.io`
- **Ưu điểm vượt trội**:
  - Có thể chạy lệnh Certbot xin **chứng chỉ SSL HTTPS / WSS Let's Encrypt xịn 100%**.
  - Không bị trình duyệt chặn WebSocket Secure (`wss://`) hay chặn Web API (Camera QR Code, Service Worker, AudioContext).
  - Trải nghiệm 100% như domain thật trên điện thoại người chơi.

**Cấu hình Nginx mẫu với `nip.io` trên Server 2**:
```nginx
# /etc/nginx/sites-available/bamboo-diplomat
server {
    listen 80;
    server_name bamboo.161.118.196.170.nip.io;

    # Nơi chứa file build frontend static hoặc proxy sang container
    location / {
        proxy_pass http://127.0.0.1:3080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API & WebSockets
    location /socket.io/ {
        proxy_pass http://127.0.0.1:8088/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8088/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
Lệnh cấp SSL HTTPS tự động trong 10 giây:
```bash
sudo certbot --nginx -d bamboo.161.118.196.170.nip.io --non-interactive --agree-tos -m admin@bamboodiplomat.vn
```

### Chiến lược 2: Truy cập qua IP trực tiếp với Nginx Custom Port / Subpath
Nếu chỉ cần kiểm tra nhanh HTTP không cần SSL:
- Truy cập thẳng: `http://161.118.196.170:3080` (Player), `http://161.118.196.170:3081` (Screen), `http://161.118.196.170:3082` (GM Console).
- Lưu ý: Cần mở tạm thời các port này trong UFW và Oracle Cloud Ingress Rules, hoặc định tuyến qua subpath trong Nginx port 80:
  - `http://161.118.196.170/bamboo/`

### Chiến lược 3: SSH Port Forwarding (An toàn nhất cho Dev / Test nội bộ)
Chạy lệnh tunnel từ máy Local để mở giao diện server ngay trên trình duyệt máy tính của bạn:
```powershell
ssh -i "C:\Users\ADMIN\Downloads\Open-claw-2\ssh-key-2026-03-18.key" -L 3080:localhost:3080 -L 3081:localhost:3081 -L 3082:localhost:3082 -L 8088:localhost:8088 ubuntu@161.118.196.170
```
Sau đó truy cập `http://localhost:3080` trên Chrome của máy tính bạn. Không cần mở bất kỳ cổng nào ra internet!

### Khi mua domain chính thức sau này
Khi người dùng mua domain (ví dụ `bamboodiplomat.io.vn` hoặc `bamboodiplomat.com`):
1. Trỏ bản ghi DNS A Record: `@` và `*` về IP `161.118.196.170`.
2. Trong file cấu hình Nginx `/etc/nginx/sites-available/bamboo-diplomat`, thay `server_name` bằng domain mới.
3. Chạy `sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com` -> Hoàn tất 100%.

---

## 🛡️ PHẦN 4: NGUYÊN TẮC AN NINH BẤT KHẢ XÂM PHẠM — ZERO-LEAK MANDATE

> [!CAUTION]
> **LỆNH TUÂN THỦ TỐI CAO ĐỐI VỚI ANTIGRAVITY VÀ TOÀN BỘ NHÓM PHÁT TRIỂN**:  
> Việc để lộ private key hoặc thông tin mật có thể dẫn tới việc hacker chiếm đoạt toàn bộ hạ tầng VPS Oracle, can thiệp vào máy chủ, mã hóa tống tiền (ransomware) hoặc đánh cắp dữ liệu. Phải tuân thủ nghiêm ngặt các điều cấm dưới đây:

### 4.1 Danh mục CẤM TUYỆT ĐỐI đưa lên Git / GitHub / Docker Image / Public Web

1. **Tuyệt đối KHÔNG commit/upload file SSH Key**:
   - `*.key`, `*.pem`, `id_rsa*`, `id_ed25519*`, `ssh-key-*.key`, `authorized_keys`, `known_hosts`.
   - Đường dẫn `C:\Users\ADMIN\Downloads\Open-claw-2\ssh-key-2026-03-18.key` chỉ được dùng để mở kết nối SSH từ máy Local của bạn, **CẤM** copy file này vào thư mục dự án hoặc đưa vào context git!
2. **Tuyệt đối KHÔNG commit file biến môi trường chứa Secret**:
   - `.env`, `.env.production`, `.env.local`, `.env.staging`.
   - Chỉ được commit file mẫu rỗng: `.env.example` (chỉ chứa các khóa giả định như `JWT_SECRET=change_me_in_production_min_32_chars`).
3. **Tuyệt đối KHÔNG hard-code Secret trong Source Code**:
   - Không ghi mật khẩu Database, Redis password, Game Master Admin Token, khóa ký JWT trong file `.ts`, `.js`, `.json`, `.yml`.
4. **Tuyệt đối KHÔNG đưa dữ liệu Runtime / Backup lên Repository**:
   - `*.rdb`, `*.aof`, `dump.sql`, `backup-*.tar.gz`, `redis-data/`, `pg-data/`.
5. **Tuyệt đối KHÔNG in Secret ra Console/Log công khai**:
   - Cấm log raw headers (Authorization, Cookie), cấm log full body payload chứa token phiên hoặc mật khẩu.

---

## 🤖 PHẦN 5: PHÒNG THỦ CHỐNG BOT QUÉT & HACKER CHIẾM SERVER (INFRASTRUCTURE & NETWORK SECURITY)

Hàng ngày có hàng vạn botnet tự động (Shodan, Censys, bot quét IP dải Oracle Cloud) lùng sục các cổng mở để khai thác:
- Cổng Redis `6379`: Bot sẽ gửi lệnh `CONFIG SET dir` để ghi file crontab hoặc SSH key vào `/root/.ssh/authorized_keys` -> **Chiếm quyền root server (RCE)**.
- Cổng PostgreSQL `5432`: Bot brute-force user `postgres`/`admin`.
- Cổng Docker `2375`: Khai thác Docker Daemon không bảo mật để leo thang đặc quyền.
- Quét các đường dẫn `.env`, `.git/config`, `phpmyadmin`, `actuator/env`.

### 5.1 "Cái bẫy" của Docker với tường lửa UFW (CRITICAL VULNERABILITY)
> [!WARNING]
> Mặc định trong Linux, khi bạn khai báo `ports: - "6379:6379"` trong `docker-compose.yml`, Docker sẽ tự động can thiệp vào `iptables` (bỏ qua tường lửa UFW) và mở cổng đó ra toàn bộ thế giới (`0.0.0.0:6379`)! Điều này khiến máy chủ bị lộ dù UFW đang bật.

**Quy chuẩn bắt buộc khi viết `docker-compose.yml` cho The Bamboo Diplomat**:
```yaml
# KHÔNG ĐƯỢC VIẾT THẾ NÀY (NGUY HIỂM CỰC ĐỘ):
# ports:
#   - "5432:5432"
#   - "6379:6379"

# BẮT BUỘC VIẾT THẾ NÀY:
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    # KHÔNG CẦN PORTS NẾU CHỈ BACKEND DÙNG!
    # Backend sẽ gọi postgres thông qua tên service 'postgres' trong internal network.
    networks:
      - bamboo-internal
    environment:
      POSTGRES_DB: bamboo_diplomat
      POSTGRES_USER: bamboo_app
      POSTGRES_PASSWORD: ${DB_PASSWORD} # Đọc từ .env trên server
    volumes:
      - bamboo_pg_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    # KHÔNG CẦN PORTS NẾU CHỈ BACKEND DÙNG!
    networks:
      - bamboo-internal
    volumes:
      - bamboo_redis_data:/data

  backend:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    restart: unless-stopped
    environment:
      DATABASE_URL: postgres://bamboo_app:${DB_PASSWORD}@postgres:5432/bamboo_diplomat
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      PORT: 8088
    # CHỈ BIND LOCALHOST 127.0.0.1 ĐỂ NGINX REVERSE PROXY VÀO:
    ports:
      - "127.0.0.1:8088:8088"
    networks:
      - bamboo-internal

networks:
  bamboo-internal:
    driver: bridge

volumes:
  bamboo_pg_data:
  bamboo_redis_data:
```

### 5.2 Tường lửa UFW & Oracle Security List
Trên Server 2, tường lửa UFW và OCI Security List **CHỈ ĐƯỢC PHÉP MỞ CÁC CỔNG SAU RA PUBLIC INTERNET**:
- Cổng `22/tcp` (SSH — Đã cấu hình xác thực bằng Key, tắt xác thực bằng Password).
- Cổng `80/tcp` (HTTP — Nginx tiếp nhận và tự động chuyển hướng sang HTTPS).
- Cổng `443/tcp` (HTTPS — Nginx tiếp nhận mã hóa TLS/SSL).
- Mọi cổng ứng dụng khác (`8088`, `3080`, `5435`, `6380`) **TUYỆT ĐỐI KHÔNG** mở trên UFW ra `Anywhere`.

### 5.3 SSH Hardening & Chống Brute-force
Server 2 đã được bảo vệ với:
- `PasswordAuthentication no` trong `/etc/ssh/sshd_config` (Hacker không thể brute-force mật khẩu SSH).
- `PermitRootLogin no` hoặc restricted.
- Fail2ban đang theo dõi các IP quét dò cổng SSH để tự động đưa vào danh sách đen (ban IP).

---

## 🔒 PHẦN 6: BẢO MẬT WEB & BACKEND (OWASP TOP 10) & CHỐNG BẺ KHÓA BẰNG POSTMAN / API TAMPERING

Một game chiến lược tương tác thời gian thực như **The Bamboo Diplomat** có đặc thù là sinh viên ngành công nghệ thông tin hoặc hacker có thể mở Chrome DevTools, Postman, Burp Suite hoặc viết script curl để can thiệp:
- Gửi vote sau khi hết giờ (`lockedAt`).
- Đổi `group_id` trong body để vote trộm thay nhóm khác hoặc hạ điểm đối thủ.
- Tự gán `role: "gm"` để xem trước đề bài hoặc sửa điểm số.
- Spam hàng nghìn request / giây để làm nghẽn server (DoS / Race condition).

Dưới đây là các tiêu chuẩn an ninh quốc tế (OWASP Top 10) bắt buộc phải tích hợp thẳng vào code Backend:

---

### 6.1 Chống bẻ khóa qua Postman & Broken Access Control (OWASP A01)

#### ❌ Lỗ hổng thường gặp (Bad Pattern)
```typescript
// CODE NGUY HIỂM — TIN TƯỞNG CLIENT:
fastify.post('/api/vote', async (req, reply) => {
  const { groupId, choice } = req.body; // KẺ TẤN CÔNG BẰNG POSTMAN CÓ THỂ ĐỔI groupId THÀNH BẤT KỲ AI!
  await db.saveVote(groupId, choice);
  return { success: true };
});
```

#### ✅ Chuẩn an ninh bắt buộc (Server-Authoritative Pattern)
1. **Zero-Trust Client Payload (Anti-IDOR)**:
   - Danh tính người chơi (`seatId`), nhóm (`groupId`), vai trò (`role`) **BẮT BUỘC** phải giải mã từ JWT Token đã được ký mật mã ở header `Authorization: Bearer <token>`.
   - **CẤM** lấy `groupId` từ `req.body`! Kẻ tấn công dùng Postman sửa body sẽ hoàn toàn vô hiệu.
2. **Server-Authoritative State Machine (Kiểm soát thời gian tuyệt đối)**:
   - Server là thẩm phán thời gian duy nhất (`Date.now()`).
   - Mọi vote gửi lên khi `serverNow > currentRound.lockedAt` **PHẢI BỊ TỪ CHỐI NGAY LẬP TỨC** với mã lỗi `403 FORBIDDEN` hoặc `400 ROUND_LOCKED`, đồng thời ghi vào sổ nhật ký kiểm toán (Audit Log) về nghi vấn can thiệp gian lận.
3. **Chống Race Condition & Double Submit (Locking)**:
   - Sử dụng Redis Atomic Lock (`SET lock:vote:{sessionId}:{roundId}:{groupId} 1 NX EX 5`) hoặc Transaction PostgreSQL với `SELECT ... FOR UPDATE` để đảm bảo mỗi nhóm chỉ có **duy nhất 1 lượt Captain-Lock** được ghi nhận. Các request gửi đồng thời qua Postman sẽ bị chặn đứng bởi cơ chế atomic.
4. **Role-Based Access Control (RBAC) nghiêm ngặt**:
   - Toàn bộ endpoint nhạy cảm của Game Master (ví dụ: `/api/gm/*`, `gm:advance_round`, `gm:reveal_scenario`, `gm:trigger_black_swan`) phải có middleware kiểm tra `requireRole('gm')`.
   - Token GM phải được tạo bằng cơ chế xác thực riêng biệt với `GM_SECRET` cực mạnh, không thể đoán được.

---

### 6.2 Ngăn chặn Injection & Cấm Tuyệt Đối RCE (OWASP A03)

1. **CẤM TUYỆT ĐỐI `eval()` VÀ `new Function()`**:
   - Ở phiên bản cũ, hiệu ứng Thiên Nga Đen (Black Swan) từng dùng `new Function` để chạy script hiệu ứng. Đây là lỗ hổng RCE chí mạng!
   - Ở phiên bản mới này, **MỌI HIỆU ỨNG GAMEPLAY ĐỀU LÀ DỮ LIỆU TĨNH (Pure Data Modifiers DSL)**:
     ```typescript
     // Chuẩn: Cấu trúc toán học thuần túy, không có code thực thi
     interface ModifierEffect {
       targetGroup: 'all' | 'highest_score' | 'specific_group';
       attribute: 'diplomatic' | 'economic' | 'security';
       operation: 'add' | 'multiply';
       value: number;
     }
     ```
2. **Ngăn chặn SQL Injection**:
   - 100% truy vấn cơ sở dữ liệu phải dùng Parameterized Queries (Prisma, Kysely hoặc pg template literals). Cấm nối chuỗi SQL thủ công (`SELECT ... WHERE id = '` + id + `'`).

---

### 6.3 Schema Validation với Zod trên 100% Route & Socket Event (OWASP A08)

Mọi dữ liệu gửi lên từ REST API hoặc Socket.IO đều phải đi qua schema parser của **Zod**. Nếu dữ liệu chứa trường lạ (chống Prototype Pollution) hoặc sai định dạng -> Từ chối ngay tại cửa ngõ:

```typescript
import { z } from 'zod';

export const SubmitVoteSchema = z.object({
  choiceId: z.enum(['A', 'B', 'C', 'D']),
  roundId: z.string().uuid(),
  // Không cho phép inject thêm bất kỳ trường nào khác
}).strict();
```

---

### 6.4 Chống Brute-Force & DoS bằng Rate Limiting (OWASP A04)

1. **REST API Rate Limit (Fastify)**:
   - Cài đặt `@fastify/rate-limit`.
   - Endpoint chung: Tối đa 60 request / phút / IP.
   - Endpoint gia nhập phòng (`/api/session/join`): Tối đa 10 request / phút / IP (chống brute-force Session PIN).
2. **Socket.IO Throttling**:
   - Giới hạn tối đa 6 message / giây / socket ID.
   - Nếu client spam quá 15 message / giây -> Ngắt kết nối socket (disconnect) và gửi cảnh báo vi phạm.

---

### 6.5 Bảo vệ Tiêu Đề HTTP (Security Headers & OWASP A05)

Tích hợp `@fastify/helmet` để tự động chèn các tiêu đề bảo mật chuẩn quốc tế:
- `Content-Security-Policy (CSP)`: Chỉ cho phép load script và asset từ origin của server, chặn tấn công XSS (Cross-Site Scripting).
- `X-Frame-Options: DENY`: Chống tấn công Clickjacking (không cho phép iframe trang web vào nơi khác).
- `X-Content-Type-Options: nosniff`: Chống tấn công MIME-type sniffing.
- `Strict-Transport-Security (HSTS)`: Ép buộc kết nối qua HTTPS.
- Tắt header `X-Powered-By: Fastify` để không làm lộ công nghệ backend cho các bot dò quét.

---

### 6.6 Sổ Cái Sự Kiện Bất Biến (Immutable Event Ledger — OWASP A09)

Mọi hành động quan trọng trong game phải được ghi vào bảng `gameplay_event_ledger` trong PostgreSQL:
- `id` (UUIDv7)
- `session_id`
- `round_number`
- `event_type` (`JOIN`, `VOTE_SUBMITTED`, `CAPTAIN_LOCKED`, `ROUND_RESOLVED`, `ALL_IN_BET`, `GM_OVERRIDE`)
- `actor_seat_id`
- `actor_group_id`
- `payload` (JSON)
- `ip_address_hash` (Mã hóa SHA256 một chiều để bảo vệ quyền riêng tư nhưng vẫn phân tích được)
- `created_at` (Server Timestamp)

> Không ai — kể cả Game Master — có quyền sửa đổi hay xóa các dòng trong bảng này. Bảng này đảm bảo tính minh bạch học thuật tuyệt đối cho buổi thuyết trình.

---

## 🚀 PHẦN 7: QUY TRÌNH THAO TÁC CHUẨN CHO ANTIGRAVITY (RUNBOOK)

Khi người dùng yêu cầu Antigravity xây dựng hoặc triển khai dự án lên Server 2, hãy thực hiện theo đúng 6 bước chuẩn sau:

### Bước 1: Kiểm tra kết nối & hạ tầng Server 2
Chạy lệnh kiểm tra nhanh tài nguyên và container hiện hữu:
```powershell
ssh -i "C:\Users\ADMIN\Downloads\Open-claw-2\ssh-key-2026-03-18.key" -o StrictHostKeyChecking=no ubuntu@161.118.196.170 "free -h && df -h / && docker ps"
```

### Bước 2: Chuẩn bị thư mục dự án trên VPS
```powershell
ssh -i "C:\Users\ADMIN\Downloads\Open-claw-2\ssh-key-2026-03-18.key" -o StrictHostKeyChecking=no ubuntu@161.118.196.170 "mkdir -p /home/ubuntu/the-bamboo-diplomat"
```

### Bước 3: Đảm bảo bảo mật trước khi đóng gói mã nguồn
- Kiểm tra `.gitignore` trên máy local: đảm bảo đã loại trừ `.env`, `*.key`, `*.pem`, `node_modules`, `dist/`.
- Tạo file `.env` trực tiếp trên VPS qua SSH hoặc truyền biến môi trường an toàn (KHÔNG lưu vào Git).

### Bước 4: Triển khai ứng dụng qua Docker Compose trên Server 2
- Khởi chạy Docker Compose cô lập trong network `bamboo-internal`.
- Khởi tạo cơ sở dữ liệu PostgreSQL (chạy migration Prisma / Kysely).

### Bước 5: Cấu hình Nginx Reverse Proxy
- Tạo file `/etc/nginx/sites-available/bamboo-diplomat` định tuyến cổng `8088` và các surface tĩnh.
- Tạo symbolic link sang `/etc/nginx/sites-enabled/`.
- Kiểm tra cú pháp: `sudo nginx -t` và tải lại: `sudo systemctl reload nginx`.

### Bước 6: Kiểm tra bảo mật (Preflight Security Checklist)
- [ ] Database và Redis **KHÔNG** bị expose ra `0.0.0.0`.
- [ ] UFW trên Server 2 chỉ mở `22`, `80`, `443`.
- [ ] Mọi API Route đều có Zod validation và Auth Guard.
- [ ] Mọi vote sau `lockedAt` đều bị server reject.
- [ ] Các khóa bí mật (`JWT_SECRET`, mật khẩu DB) có độ dài tối thiểu 32 ký tự ngẫu nhiên.
- [ ] Không có bất kỳ private key hay secret nào bị lọt vào repo hoặc public folder.

---

## 📋 TÓM TẮT DÀNH RIÊNG CHO AGENT

```
ĐÂY LÀ DỰ ÁN: THE BAMBOO DIPLOMAT
SERVER TARGET: SERVER 2 (IP: 161.118.196.170, User: ubuntu)
SSH KEY: C:\Users\ADMIN\Downloads\Open-claw-2\ssh-key-2026-03-18.key
FOLDER KEY: C:\Users\ADMIN\Downloads\Open-claw-2\
TRẠNG THÁI DOMAIN: CHƯA MUA (Dùng nip.io / sslip.io / Nginx port để dev và staging)
TIÊU CHUẨN AN NINH: OWASP Top 10, Zero-Trust Payload, Anti-IDOR, Server-Authoritative, Không mở port DB ra ngoài, Không upload SSH key.
```
