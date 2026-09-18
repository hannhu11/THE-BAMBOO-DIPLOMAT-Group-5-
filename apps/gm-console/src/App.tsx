import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button, Panel, StatusPill, Timer, Icon, VolumeToggle, audioEngine } from '@bamboo/ui-kit';

export function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('bamboo_gm_token'));
  const [password, setPassword] = useState('bambooGM2026!');
  const [loginError, setLoginError] = useState('');

  // GM State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [session, setSession] = useState<any>(null);
  const [scenario, setScenario] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [presence, setPresence] = useState<any>({ onlineSeats: 0, onlineGroups: 0, captainReadyCount: 0 });
  const [remainingSec, setRemainingSec] = useState(45);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [roundDecisions, setRoundDecisions] = useState<Record<string, any>>({});

  // Modals & form states
  const [selectedScenarioId, setSelectedScenarioId] = useState('sc1');
  const [allInGroupId, setAllInGroupId] = useState('G04');
  const [allInStars, setAllInStars] = useState(3);
  const [blackSwanEventId, setBlackSwanEventId] = useState('bs_semi');
  const [challengeDefenderId, setChallengeDefenderId] = useState('G01');
  const [challengeChallengerId, setChallengeChallengerId] = useState('G07');
  const [challengeStars, setChallengeStars] = useState(2);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch('/api/gm/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Mật khẩu quản trò không chính xác');
      }

      setToken(data.token);
      localStorage.setItem('bamboo_gm_token', data.token);
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  // Socket & Sync
  useEffect(() => {
    if (!token) return;

    const s = io({
      path: '/socket.io/',
      auth: { role: 'gm' },
    });

    s.on('session.synced', (data: any) => {
      setSession(data.session);
      setScenario(data.currentScenario);
      setGroups(data.groups || []);
      setLeaderboard(data.leaderboard || []);
      setPresence(data.presence || { onlineSeats: 0, onlineGroups: 0 });
      if (data.roundDecisions) {
        setRoundDecisions(data.roundDecisions);
      }
    });

    s.on('round.opened', (data: any) => {
      setSession(data.session);
      setScenario(data.scenario);
      setRemainingSec(data.durationSeconds || 45);
      setRoundDecisions({});
      addAudit(`Vòng 0${data.session.currentRound} đã mở (${data.durationSeconds}s)`);
    });

    s.on('round.locked', (data: any) => {
      setSession(data.session);
      addAudit(`Vòng chơi đã khóa phiếu`);
    });

    s.on('round.revealed', (data: any) => {
      setSession(data.session);
      setLeaderboard(data.leaderboard || []);
      if (data.roundDecisions) {
        setRoundDecisions(data.roundDecisions);
      }
      addAudit(`Công bố kết quả vòng chơi`);
    });

    s.on('leaderboard.updated', (lb: any) => {
      setLeaderboard(lb);
    });

    s.on('presence.updated', (p: any) => {
      setPresence(p);
    });

    s.on('participation.updated', (data: any) => {
      if (data.groupId) {
        addAudit(`Nhóm ${data.groupId} cập nhật dự thảo (${data.totalDrafts} phiếu)`);
      }
      if (data.lockedDecisions) {
        const updateMap: Record<string, any> = {};
        for (const item of data.lockedDecisions) {
          updateMap[item.groupId] = { isLocked: true, allInArmed: item.allInArmed };
        }
        setRoundDecisions((prev) => ({ ...prev, ...updateMap }));
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [token]);

  const addAudit = (msg: string) => {
    const time = new Date().toLocaleTimeString('vi-VN');
    setAuditLogs((prev) => [{ time, msg }, ...prev.slice(0, 20)]);
  };

  // Timer
  useEffect(() => {
    if (session?.status !== 'round_open' || remainingSec <= 0) return;
    const interval = setInterval(() => {
      setRemainingSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.status, remainingSec]);

  // GM API Actions
  const openRound = async () => {
    if (!token) return;
    audioEngine.playGong();
    await fetch('/api/gm/round/open', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        scenarioId: selectedScenarioId,
        durationSeconds: 45,
      }),
    });
  };

  const lockRound = async () => {
    if (!token) return;
    audioEngine.playStamp();
    await fetch('/api/gm/round/lock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ force: true }),
    });
  };

  const revealRound = async () => {
    if (!token) return;
    audioEngine.playFanfare();
    await fetch('/api/gm/round/reveal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });
  };

  const gradeAllIn = async () => {
    if (!token) return;
    await fetch('/api/gm/all-in/grade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        groupId: allInGroupId,
        stars: allInStars,
        gmNote: 'Chấm điểm trực tiếp tại lớp',
      }),
    });
    addAudit(`Đã chấm All-in ${allInStars} sao cho nhóm ${allInGroupId}`);
  };

  const resolveChallenge = async () => {
    if (!token) return;
    await fetch('/api/gm/challenge/resolve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        challengerGroupId: challengeChallengerId,
        defenderGroupId: challengeDefenderId,
        stars: challengeStars,
        gmNote: 'Chất vấn đa phương tại hội trường',
      }),
    });
    addAudit(`Chất vấn: ${challengeDefenderId} bảo vệ (${challengeStars} sao)`);
  };

  const triggerBlackSwan = async () => {
    if (!token) return;
    if (!confirm('Xác nhận kích hoạt Thiên Nga Đen?')) return;
    audioEngine.playSiren();
    await fetch('/api/gm/event/black-swan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ eventId: blackSwanEventId }),
    });
    addAudit(`Kích hoạt biến cố Thiên Nga Đen: ${blackSwanEventId}`);
  };

  // 1. Login View
  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#03080A' }}>
        <Panel variant="elevated" style={{ width: 400, padding: 30 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-gold-300)', letterSpacing: 2 }}>
            SITUATION ROOM · GM CONSOLE
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', margin: '8px 0 20px' }}>Đăng nhập Quản trò</h2>

          {loginError && (
            <div style={{ color: 'var(--color-crimson)', fontSize: 13, marginBottom: 12 }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-slate-300)' }}>Mật khẩu Quản trò (GM Secret)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: 12,
                  marginTop: 6,
                  background: '#0B1512',
                  border: '1px solid #33413D',
                  borderRadius: 8,
                  color: 'white',
                }}
                required
              />
            </div>
            <Button type="submit" variant="primary">
              Đăng Nhập Quản Trị
            </Button>
          </form>
        </Panel>
      </div>
    );
  }

  // 2. GM Dashboard View
  return (
    <div className="stage">
      {/* Left Sidebar */}
      <aside className="side">
        <div className="brand">
          <div className="brand-m">
            <Icon name="lock" size={20} />
          </div>
          <div>
            <h1 className="brand-h1">GM CONSOLE</h1>
            <div className="brand-s">SITUATION ROOM · v1.0</div>
          </div>
        </div>

        <nav className="nav">
          <div className="nav-item on">• Bảng điều khiển chính</div>
          <div className="nav-item" onClick={revealRound}>• Công bố kết quả (Reveal)</div>
          <div className="nav-item" onClick={lockRound}>• Khóa vòng chơi ngay</div>
        </nav>

        {/* Quick Audio Engine Testbench for GM */}
        <div style={{ marginTop: 20, padding: '12px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-gold-300)', letterSpacing: 1.5, marginBottom: 8, fontWeight: 700 }}>
            HIỆU ỨNG ÂM THANH (TEST)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <button
              onClick={() => audioEngine.playGong()}
              style={{ padding: '6px 4px', fontSize: 10, background: 'rgba(216,180,109,0.15)', color: '#F3CA68', border: '1px solid rgba(216,180,109,0.3)', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              Cồng Lệnh
            </button>
            <button
              onClick={() => audioEngine.playHeartbeat()}
              style={{ padding: '6px 4px', fontSize: 10, background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              Nhịp Tim
            </button>
            <button
              onClick={() => audioEngine.playStamp()}
              style={{ padding: '6px 4px', fontSize: 10, background: 'rgba(216,180,109,0.15)', color: '#F3CA68', border: '1px solid rgba(216,180,109,0.3)', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              Triện Sáp
            </button>
            <button
              onClick={() => audioEngine.playSiren()}
              style={{ padding: '6px 4px', fontSize: 10, background: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid #EF4444', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              Còi Báo Động
            </button>
            <button
              onClick={() => audioEngine.playFanfare()}
              style={{ padding: '6px 4px', fontSize: 10, background: 'rgba(16,185,129,0.15)', color: '#34D399', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              Kèn Lệnh
            </button>
            <button
              onClick={() => audioEngine.playCardFlip()}
              style={{ padding: '6px 4px', fontSize: 10, background: 'rgba(255,255,255,0.08)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              Lật Bài
            </button>
          </div>
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(230,223,202,0.08)', paddingTop: 16 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-slate-300)', lineHeight: 1.8 }}>
            <div>TRẠNG THÁI: <b>{session?.status?.toUpperCase()}</b></div>
            <div>SINH VIÊN: <b>{presence.onlineSeats} / 34</b></div>
            <div>NHÓM TRƯỞNG: <b>{presence.captainReadyCount} / 7</b></div>
            <div>VÒNG CHƠI: <b>0{session?.currentRound} / 3</b></div>
          </div>
        </div>
      </aside>

      {/* Center Column: Round Controls & Groups */}
      <main className="main-col">
        {/* Header bar */}
        <header className="gm-hdr">
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 20 }}>
              {scenario ? `Vòng 0${session?.currentRound}: ${scenario.title}` : 'Phiên chưa mở vòng'}
            </h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-gold-300)', marginTop: 4 }}>
              MÃ PHÒNG: HCM202 · SERVER 2 OCI
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <VolumeToggle />

            <select
              value={selectedScenarioId}
              onChange={(e) => setSelectedScenarioId(e.target.value)}
              style={{
                padding: '10px 14px',
                background: 'rgba(9, 18, 14, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#FFFFFF',
                borderRadius: 12,
                fontFamily: 'var(--font-ui)',
                fontSize: 14,
                fontWeight: 600,
                outline: 'none',
              }}
            >
              <option value="sc1" style={{ background: '#0F1A15', color: '#FFFFFF' }}>Tình huống 1 (Cáp quang)</option>
              <option value="sc2" style={{ background: '#0F1A15', color: '#FFFFFF' }}>Tình huống 2 (LHQ)</option>
              <option value="sc3" style={{ background: '#0F1A15', color: '#FFFFFF' }}>Tình huống 3 (JETP Xanh)</option>
            </select>

            <Button variant="primary" onClick={openRound}>
              Mở Vòng Chơi (45s)
            </Button>
            <Button variant="danger" onClick={lockRound}>
              Khóa Vòng
            </Button>
            <Button variant="warn" onClick={revealRound}>
              Công Bố (Reveal)
            </Button>
          </div>
        </header>

        {/* Center Panels: Active Timer & Group Decisions */}
        <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 16 }}>
          {/* Round status & countdown */}
          <Panel variant="elevated" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-gold-300)' }}>
                ĐỒNG HỒ ĐẾM NGƯỢC
              </div>
              <div style={{ fontSize: 14, color: 'var(--color-slate-300)', marginTop: 4 }}>
                {session?.status === 'round_open' ? 'Sinh viên đang thảo luận và biểu quyết' : 'Vòng đang đóng'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Timer secondsLeft={remainingSec} size="lg" />
              <Button variant="ghost" onClick={() => setRemainingSec((s) => s + 15)}>
                +15s
              </Button>
            </div>
          </Panel>

          {/* Group Status Table */}
          <Panel variant="standard">
            <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 12px' }}>
              TIẾN ĐỘ KHÓA PHIẾU CÁC NHÓM (7 NHÓM)
            </h3>

            <table className="group-table">
              <thead>
                <tr>
                  <th>MÃ NHÓM</th>
                  <th>TRẠNG THÁI</th>
                  <th>PHƯƠNG ÁN</th>
                  <th>ALL-IN</th>
                  <th>ĐIỂM SỐ</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => {
                  const dec = roundDecisions[g.id];
                  const isLocked = dec?.isLocked || session?.status === 'round_reveal';
                  return (
                    <tr key={g.id}>
                      <td><b>{g.name}</b></td>
                      <td>
                        <StatusPill tone={isLocked ? 'locked' : 'draft'}>
                          {isLocked ? 'LOCKED' : 'DRAFTING'}
                        </StatusPill>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {session?.status === 'round_reveal'
                          ? (dec?.chosenOption || 'C (Mặc định)')
                          : isLocked
                          ? 'Đã chốt'
                          : 'Đang thảo luận'}
                      </td>
                      <td>
                        {dec?.allInArmed
                          ? 'CÓ (All-In)'
                          : g.allInUses > 0
                          ? `${g.allInUses}/2 lần`
                          : 'Chưa'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {g.totalScore}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>
        </div>
      </main>

      {/* Right Column: GM Interactive Tools */}
      <aside className="right-col">
        {/* All-in Grading */}
        {/* All-in Grading */}
        <Panel variant="elevated">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-gold-300)', letterSpacing: 2, fontWeight: 700 }}>
            CHẤM ĐIỂM ALL-IN (0-5 SAO)
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <select
              value={allInGroupId}
              onChange={(e) => setAllInGroupId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(9, 18, 14, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#FFFFFF',
                borderRadius: 10,
                fontFamily: 'var(--font-ui)',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id} style={{ background: '#0F1A15', color: '#FFFFFF' }}>
                  {g.name} ({g.id})
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setAllInStars(s)}
                  style={{
                    flex: 1,
                    height: 38,
                    borderRadius: 10,
                    border: allInStars >= s ? '1.5px solid #F3CA68' : '1px solid rgba(255, 255, 255, 0.15)',
                    background: allInStars >= s ? 'linear-gradient(180deg, #F3CA68 0%, #D97706 100%)' : 'rgba(255, 255, 255, 0.05)',
                    color: allInStars >= s ? '#091410' : '#64748B',
                    fontSize: 18,
                    cursor: 'pointer',
                    fontWeight: 800,
                    boxShadow: allInStars >= s ? '0 0 10px rgba(243, 202, 104, 0.4)' : 'none',
                    transition: 'all 140ms ease',
                  }}
                >
                  ★
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAllInStars(0)}
                style={{
                  height: 38,
                  padding: '0 10px',
                  borderRadius: 10,
                  border: allInStars === 0 ? '1.5px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.15)',
                  background: allInStars === 0 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  color: allInStars === 0 ? '#FCA5A5' : '#64748B',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                }}
              >
                0★
              </button>
            </div>
          </div>

          <Button variant="primary" fullWidth style={{ marginTop: 12 }} onClick={gradeAllIn}>
            Xác Nhận {allInStars}★ Cho {allInGroupId}
          </Button>
        </Panel>

        {/* Multilateral Challenge */}
        <Panel variant="elevated">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-gold-300)', letterSpacing: 2, fontWeight: 700 }}>
            CHẤT VẤN ĐA PHƯƠNG
          </div>
          <div style={{ fontSize: 13, color: '#CBD5E1', margin: '8px 0 12px' }}>
            Nhóm <b>{challengeChallengerId}</b> chất vấn nhóm dẫn đầu <b>{challengeDefenderId}</b>.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setChallengeStars(s)}
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 10,
                    border: challengeStars >= s ? '1.5px solid #F3CA68' : '1px solid rgba(255, 255, 255, 0.15)',
                    background: challengeStars >= s ? 'linear-gradient(180deg, #F3CA68 0%, #D97706 100%)' : 'rgba(255, 255, 255, 0.05)',
                    color: challengeStars >= s ? '#091410' : '#64748B',
                    fontSize: 16,
                    cursor: 'pointer',
                    fontWeight: 800,
                    boxShadow: challengeStars >= s ? '0 0 10px rgba(243, 202, 104, 0.4)' : 'none',
                    transition: 'all 140ms ease',
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', textAlign: 'center', color: challengeStars >= 3 ? '#86EFAC' : '#FCA5A5', fontWeight: 600 }}>
              {challengeStars >= 3 ? `✓ ${challengeStars}★: Bảo vệ thành công (+10 UT)` : `✗ ${challengeStars}★: Thất bại (-20 UT)`}
            </div>

            <Button variant="ghost" fullWidth onClick={resolveChallenge}>
              Chốt Điểm Chất Vấn ({challengeStars}★)
            </Button>
          </div>
        </Panel>

        {/* Black Swan Event Trigger */}
        <div className="event-box">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: '#E8C2A6', letterSpacing: 2 }}>
            BIẾN CỐ THIÊN NGA ĐEN
          </div>
          <h4 style={{ margin: '6px 0', fontFamily: 'var(--font-display)' }}>
            Kích hoạt sau Vòng 3
          </h4>
          <select
            value={blackSwanEventId}
            onChange={(e) => setBlackSwanEventId(e.target.value)}
            style={{ width: '100%', padding: 8, background: '#150708', border: '1px solid #A9474F', color: 'white', borderRadius: 8, marginTop: 6 }}
          >
            <option value="bs_semi">Đứt gãy chuỗi cung ứng bán dẫn</option>
            <option value="bs_energy">Khủng hoảng năng lượng châu Á</option>
            <option value="bs_ai_cyber">Tấn công mạng vào hệ thống tài chính</option>
            <option value="bs_currency">Lạm phát và điều chỉnh tỷ giá toàn cầu</option>
          </select>

          <Button variant="danger" style={{ marginTop: 12, width: '100%' }} onClick={triggerBlackSwan}>
            Kích Hoạt Thiên Nga Đen
          </Button>
        </div>

        {/* Audit Log Stream */}
        <div className="audit-box">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 8, color: 'var(--color-paper-light)' }}>
            NHẬT KÝ SỰ KIỆN (AUDIT LOG)
          </div>
          {auditLogs.map((log, i) => (
            <div key={i} style={{ padding: '4px 0', borderBottom: '1px dashed rgba(230,223,202,0.08)' }}>
              <span style={{ color: 'var(--color-gold-300)' }}>[{log.time}]</span> {log.msg}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
