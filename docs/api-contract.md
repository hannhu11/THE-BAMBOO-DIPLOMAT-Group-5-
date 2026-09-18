# API & WEBSOCKET CONTRACT SPECIFICATION
## THE BAMBOO DIPLOMAT (HCM202 · SE1802)

---

### 1. REST ENDPOINTS

#### A. Public / Authentication
- `POST /api/session/join`
  - Body: `{ sessionPin: string, studentName: string, groupId: string, memberIndex: number }`
  - Returns: `{ success: true, isReconnect: boolean, token: string, seat: Seat, session: GameSession }`
- `POST /api/gm/login`
  - Body: `{ password: string }`
  - Returns: `{ success: true, role: 'gm', token: string }`
- `GET /api/bootstrap`
  - Returns: `{ session: GameSession, groups: Group[], currentScenario?: ScenarioItem, leaderboard: LeaderboardEntry[], roundDecisions: Record<string, any> }`
- `GET /api/health`
  - Returns: `{ status: 'ok', service: 'bamboo-api', uptime: number, timestamp: number }`

#### B. Game Master (Requires Bearer GM Token)
- `POST /api/gm/round/open`
  - Body: `{ scenarioId: string, durationSeconds?: number }`
- `POST /api/gm/round/lock`
  - Body: `{ force?: boolean }`
- `POST /api/gm/round/reveal`
  - Returns: `{ success: true, session: GameSession, resolutions: Record<string, RoundResolution>, leaderboard: LeaderboardEntry[] }`
- `POST /api/gm/all-in/grade`
  - Body: `{ groupId: string, stars: number (0-5), gmNote?: string }`
- `POST /api/gm/challenge/resolve`
  - Body: `{ challengerGroupId: string, defenderGroupId: string, stars: number (0-5), gmNote?: string }`
- `POST /api/gm/event/black-swan`
  - Body: `{ eventId: string }`

---

### 2. WEBSOCKET (SOCKET.IO) EVENTS

#### Server → Client (Broadcast & Rooms)
- `session.synced`: Dữ liệu bootstrap khi client kết nối hoặc reconnect.
- `round.opened`: Quản trò mở vòng chơi mới (kèm thời lượng và chi tiết tình huống).
- `round.locked`: Khóa nhận phiếu biểu quyết.
- `round.revealed`: Công bố kết quả tính điểm và lời dạy Hồ Chí Minh.
- `leaderboard.updated`: Bảng xếp hạng 7 nhóm sau tính điểm hoặc chấm All-In.
- `presence.updated`: Cập nhật số lượng Seat online thực tế.
- `group.state.updated`: Đồng bộ dự thảo nội bộ cho các thành viên trong nhóm.
- `group.decision.locked`: Thông báo nhóm trưởng đã khóa phiếu thành công.
- `banner.pushed`: Phát thông điệp khẩn cấp (Biến cố Thiên Nga Đen).

#### Client → Server
- `seat.heartbeat`: Gửi định kỳ mỗi 5s để cập nhật trạng thái online.
- `vote.draft.select`: Thành viên gửi lựa chọn dự thảo (`{ roundId, selectedOption, allInEnabled, selectedCard, selectedAllianceTarget }`).
- `vote.lock`: Nhóm trưởng khóa phiếu chính thức (`{ roundId, chosenOption, allInArmed, activeCard, allianceTargetGroupId }`).
