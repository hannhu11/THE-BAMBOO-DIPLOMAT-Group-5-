import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Button,
  ChoiceCard,
  DeltaChip,
  Icon,
  Panel,
  StatusPill,
  Timer,
  TacticalCard,
  VolumeToggle,
  DecryptedText,
  audioEngine,
} from '@bamboo/ui-kit';
import { ChoiceLetter, CardType, Role } from '@bamboo/domain-types';

interface SeatData {
  id: string;
  groupId: string;
  studentName: string;
  memberIndex: number;
  role: Role;
}

export function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('bamboo_token'));
  const [seat, setSeat] = useState<SeatData | null>(() => {
    const saved = localStorage.getItem('bamboo_seat');
    return saved ? JSON.parse(saved) : null;
  });

  // Join form state
  const [pin, setPin] = useState('HCM202');
  const [studentName, setStudentName] = useState('');
  const [groupId, setGroupId] = useState('G01');
  const [memberIndex, setMemberIndex] = useState(1);
  const [joinError, setJoinError] = useState('');

  // Game state
  const [socket, setSocket] = useState<Socket | null>(null);
  const [session, setSession] = useState<any>(null);
  const [scenario, setScenario] = useState<any>(null);
  const [selectedChoice, setSelectedChoice] = useState<ChoiceLetter>('C');
  const [allInArmed, setAllInArmed] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardType | undefined>(undefined);
  const [allianceTarget, setAllianceTarget] = useState<string>('G02');
  const [isLocked, setIsLocked] = useState(false);
  const [remainingSec, setRemainingSec] = useState(45);
  const [consensus, setConsensus] = useState<any>(null);
  const [wisdom, setWisdom] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [myGroup, setMyGroup] = useState<any>(null);

  // Socket connection
  useEffect(() => {
    if (!token || !seat) return;

    const s = io({
      path: '/socket.io/',
      auth: {
        seatId: seat.id,
        role: seat.role,
        groupId: seat.groupId,
      },
    });

    s.on('connect', () => {
      setStatusMessage('Đã kết nối máy chủ');
    });

    s.on('session.synced', (data) => {
      setSession(data.session);
      setScenario(data.currentScenario);
      if (data.groups) {
        const found = data.groups.find((g: any) => g.id === seat.groupId);
        if (found) setMyGroup(found);
      }
      if (data.currentScenario?.wisdom) {
        setWisdom(data.currentScenario.wisdom);
      }
      const myGroupDecision = data.roundDecisions?.[seat.groupId];
      if (myGroupDecision) {
        setIsLocked(myGroupDecision.isLocked);
        setSelectedChoice(myGroupDecision.chosenOption as ChoiceLetter);
        setAllInArmed(myGroupDecision.allInArmed);
      }
    });

    s.on('leaderboard.updated', (lb: any[]) => {
      if (Array.isArray(lb)) {
        const entry = lb.find((item: any) => item.groupId === seat.groupId);
        if (entry) {
          setMyGroup((prev: any) => (prev ? { ...prev, rank: entry.rank, totalScore: entry.score } : prev));
        }
      }
    });

    s.on('round.opened', (data) => {
      setSession(data.session);
      setScenario(data.scenario);
      setIsLocked(false);
      setRemainingSec(data.durationSeconds || 45);
      setStatusMessage('Vòng mới bắt đầu');
      audioEngine.playGong();
    });

    s.on('round.locked', (data) => {
      setSession(data.session);
      setIsLocked(true);
      setStatusMessage('Vòng chơi đã khóa');
      audioEngine.playStamp();
    });

    s.on('round.revealed', (data) => {
      setSession(data.session);
      setIsLocked(true);
      if (scenario?.wisdom) {
        setWisdom(scenario.wisdom);
      }
      setStatusMessage('Đã công bố kết quả vòng chơi');
      audioEngine.playFanfare();
    });

    s.on('banner.pushed', () => {
      audioEngine.playSiren();
    });

    s.on('group.state.updated', (data) => {
      setConsensus(data);
    });

    s.on('group.decision.locked', (decision) => {
      if (decision.groupId === seat.groupId) {
        setIsLocked(true);
        setSelectedChoice(decision.chosenOption);
        setStatusMessage('Nhóm trưởng đã khóa phiếu!');
        audioEngine.playStamp();
      }
    });

    setSocket(s);

    const heartbeatInterval = setInterval(() => {
      s.emit('seat.heartbeat');
    }, 5000);

    return () => {
      clearInterval(heartbeatInterval);
      s.disconnect();
    };
  }, [token, seat]);

  // Countdown timer with audio tension
  useEffect(() => {
    if (session?.status !== 'round_open' || remainingSec <= 0) return;
    if (remainingSec === 10 || remainingSec === 5 || remainingSec === 3 || remainingSec === 1) {
      audioEngine.playHeartbeat();
    }
    const t = setInterval(() => {
      setRemainingSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [session?.status, remainingSec]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');

    try {
      const res = await fetch('/api/session/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionPin: pin,
          studentName,
          groupId,
          memberIndex,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Lỗi khi vào phòng chơi');
      }

      setToken(data.token);
      setSeat(data.seat);
      localStorage.setItem('bamboo_token', data.token);
      localStorage.setItem('bamboo_seat', JSON.stringify(data.seat));
    } catch (err: any) {
      setJoinError(err.message);
    }
  };

  const handleVoteSubmit = () => {
    if (!socket || !seat || !scenario) return;

    if (seat.role === 'captain') {
      // Captain final lock
      socket.emit('vote.lock', {
        roundId: scenario.id,
        chosenOption: selectedChoice,
        allInArmed,
        activeCard: selectedCard,
        allianceTargetGroupId: selectedCard === 'alliance' ? allianceTarget : undefined,
      });
    } else {
      // Member draft suggestion
      socket.emit('vote.draft.select', {
        roundId: scenario.id,
        selectedOption: selectedChoice,
        allInEnabled: allInArmed,
        selectedCard,
        selectedAllianceTarget: selectedCard === 'alliance' ? allianceTarget : undefined,
      });
      setStatusMessage('Đã gửi ý kiến dự thảo cho Nhóm trưởng');
    }
  };

  // 1. Lobby screen
  if (!token || !seat) {
    return (
      <div className="player-shell">
        <div className="header">
          <div className="brand">
            <div className="brand-icon">
              <Icon name="autonomy" size={16} />
            </div>
            <div>
              <div className="brand-title">THE BAMBOO DIPLOMAT</div>
              <div className="brand-sub">KỶ NGUYÊN ĐA CỰC · SE1802</div>
            </div>
          </div>
        </div>

        <Panel variant="elevated">
          <div className="kicker">THAM GIA PHÒNG CHƠI</div>
          <h2 style={{ fontFamily: 'var(--font-display)', margin: '8px 0 16px' }}>Đăng nhập vị trí (Seat)</h2>

          {joinError && (
            <div style={{ color: 'var(--color-crimson)', marginBottom: 12, fontSize: 13 }}>
              {joinError}
            </div>
          )}

          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>Mã PIN phòng chơi</label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(9, 18, 14, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: 12,
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 15,
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>Họ và tên sinh viên</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(9, 18, 14, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: 12,
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 14.5,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>Mã nhóm (G01 - G07)</label>
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(9, 18, 14, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    borderRadius: 12,
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 14,
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {['G01', 'G02', 'G03', 'G04', 'G05', 'G06', 'G07'].map((g) => (
                    <option key={g} value={g} style={{ background: '#0F1A15', color: '#FFFFFF' }}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#CBD5E1', marginBottom: 6 }}>Vị trí (1: Captain)</label>
                <select
                  value={memberIndex}
                  onChange={(e) => setMemberIndex(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(9, 18, 14, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    borderRadius: 12,
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 13.5,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <option key={idx} value={idx} style={{ background: '#0F1A15', color: '#FFFFFF' }}>
                      {idx === 1 ? '1 (Nhóm trưởng)' : `${idx} (Thành viên)`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="submit" variant="primary" fullWidth style={{ marginTop: 8 }}>
              Vào Vị Trí Tham Chiến
            </Button>
          </form>
        </Panel>
      </div>
    );
  }

  // 2. In-game player screen
  return (
    <div className="player-shell">
      {/* Header */}
      <div className="header">
        <div className="brand">
          <div className="brand-icon">
            <Icon name="autonomy" size={16} />
          </div>
          <div>
            <div className="brand-title">THE BAMBOO DIPLOMAT</div>
            <div className="brand-sub">SITUATION ROOM · FALL26</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <VolumeToggle />
          <StatusPill tone={isLocked ? 'locked' : 'draft'}>
            {seat.groupId} · {seat.role.toUpperCase()}
          </StatusPill>
        </div>
      </div>

      {/* Phase & Timer Bar */}
      <div className="phase-bar">
        <div className="phase-pill">
          {session?.status === 'round_reveal' ? 'REVEAL' : `ROUND 0${session?.currentRound || 1}`}
        </div>
        <Timer secondsLeft={remainingSec} />
      </div>

      {/* Active Scenario (CÔNG ĐIỆN NGOẠI GIAO TỐI KHẨN) */}
      {scenario ? (
        <div
          className="card-scenario relative overflow-hidden"
          style={{
            border: '1.5px solid rgba(216, 180, 109, 0.35)',
            background: 'linear-gradient(175deg, rgba(24, 38, 30, 0.95) 0%, rgba(11, 20, 16, 0.98) 100%)',
            boxShadow: '0 20px 45px rgba(0,0,0,0.6), inset 0 1px 0 rgba(243, 202, 104, 0.2)',
            position: 'relative',
          }}
        >
          {/* Crimson Red Wax Seal in top right corner */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 8px',
              background: 'linear-gradient(135deg, #8B1A1A 0%, #540D0D 100%)',
              border: '1px solid #D8B46D',
              borderRadius: 6,
              boxShadow: '0 2px 8px rgba(139, 26, 26, 0.6), inset 0 1px 0 rgba(255,255,255,0.25)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#EF4444',
                boxShadow: '0 0 6px #EF4444',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: '#FEE2E2',
                fontWeight: 800,
                letterSpacing: 1,
              }}
            >
              TỐI KHẨN
            </span>
          </div>

          <div className="kicker" style={{ color: '#D8B46D', letterSpacing: 2 }}>
            CÔNG ĐIỆN NGOẠI GIAO · {scenario.principle || 'SÁCH LƯỢC QUỐC GIA'}
          </div>

          <h1 className="scenario-title" style={{ marginTop: 8, marginBottom: 10, color: '#F3EEDC' }}>
            <DecryptedText text={scenario.title} speed={25} />
          </h1>

          <p className="scenario-desc" style={{ color: '#CBD5E1', fontSize: 13.5, lineHeight: 1.65 }}>
            {scenario.context}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 14,
              paddingTop: 10,
              borderTop: '1px dashed rgba(216, 180, 109, 0.25)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: '#8E9C95',
            }}
          >
            <span>MÃ ĐIỆN: CD-HCM202-0{session?.currentRound || 1}</span>
            <span style={{ color: '#D8B46D' }}>CẤP ĐỘ: TUYỆT MẬT</span>
          </div>
        </div>
      ) : (
        <Panel>
          <div style={{ textAlign: 'center', padding: 20 }}>
            Đang chờ Quản trò (GM) mở vòng chơi...
          </div>
        </Panel>
      )}

      {/* Wisdom Quote during Reveal */}
      {session?.status === 'round_reveal' && wisdom && (
        <Panel variant="elevated">
          <div className="kicker">LỜI DẠY CỦA CHỦ TỊCH HỒ CHÍ MINH</div>
          <blockquote style={{ margin: '8px 0', fontStyle: 'italic', color: 'var(--color-paper-light)' }}>
            "{wisdom.quote}"
          </blockquote>
          <div style={{ fontSize: 11, color: 'var(--color-gold-300)', textAlign: 'right' }}>
            — {wisdom.source}
          </div>
        </Panel>
      )}

      {/* Choices */}
      {scenario && (
        <div className="choices-container">
          {scenario.options.map((opt: any) => (
            <ChoiceCard
              key={opt.id}
              letter={opt.id}
              title={opt.label}
              description={opt.hint}
              selected={selectedChoice === opt.id}
              locked={isLocked}
              onClick={() => {
                if (!isLocked) {
                  setSelectedChoice(opt.id);
                  audioEngine.playClick();
                }
              }}
              impacts={[
                { label: 'TỰ CHỦ', delta: opt.isBalanced ? 1 : 0 },
                { label: 'KINH TẾ', delta: opt.id === 'A' ? 2 : -1 },
                { label: 'UY TÍN', delta: opt.id === 'C' ? 1 : 0 },
              ]}
            />
          ))}
        </div>
      )}

      {/* Mechanics: All-In and 3D Tactical Cards */}
      <div className="mechanics-section">
        {/* All-in toggle */}
        <div
          className="allin-box"
          style={{
            border: allInArmed ? '1.5px solid #F3CA68' : '1px dashed rgba(216, 180, 109, 0.4)',
            background: allInArmed
              ? 'linear-gradient(180deg, rgba(46, 35, 14, 0.92) 0%, rgba(22, 17, 7, 0.95) 100%)'
              : 'linear-gradient(180deg, rgba(24, 34, 28, 0.85) 0%, rgba(12, 20, 16, 0.90) 100%)',
            boxShadow: allInArmed ? '0 0 20px rgba(243, 202, 104, 0.3)' : undefined,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: '#D8B46D',
                letterSpacing: 2,
                fontWeight: 700,
              }}
            >
              QUYẾT TỬ ĐỘT PHÁ · ALL-IN (HẠNG 4–7)
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', marginTop: 2 }}>
              {myGroup && myGroup.rank < 4
                ? `Chỉ dành cho Hạng 4–7 (Hiện tại: Hạng ${myGroup.rank})`
                : myGroup && myGroup.allInUses >= 2
                ? `Đã hết lượt (2/2 lần)`
                : `Tối đa 2 lần/game (Hạng: ${myGroup?.rank || '—'})`}
            </div>
          </div>
          <input
            type="checkbox"
            checked={allInArmed}
            disabled={isLocked || (myGroup && (myGroup.rank < 4 || myGroup.allInUses >= 2))}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setAllInArmed(e.target.checked);
              if (e.target.checked) audioEngine.playCardActivate();
              else audioEngine.playClick();
            }}
            style={{ width: 18, height: 18, accentColor: '#D8B46D', cursor: 'pointer' }}
          />
        </div>

        {/* Policy Cards (3D Interactive Cards) */}
        <div style={{ marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--color-gold-300)',
                letterSpacing: 2,
                fontWeight: 700,
              }}
            >
              THẺ BÀI SÁCH LƯỢC CHIẾN LƯỢC
            </span>
            <span style={{ fontSize: 9.5, color: '#8E9C95', fontStyle: 'italic' }}>
              Chạm để soi & kích hoạt
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <TacticalCard
              type="anchor"
              compact={true}
              status={selectedCard === 'anchor' ? 'active' : 'ready'}
              canActivate={!isLocked}
              onActivate={() => {
                if (isLocked) return;
                const next = selectedCard === 'anchor' ? undefined : 'anchor';
                setSelectedCard(next);
                if (next) audioEngine.playCardActivate();
                else audioEngine.playClick();
              }}
            />
            <TacticalCard
              type="alliance"
              compact={true}
              status={selectedCard === 'alliance' ? 'active' : 'ready'}
              canActivate={!isLocked}
              onActivate={() => {
                if (isLocked) return;
                const next = selectedCard === 'alliance' ? undefined : 'alliance';
                setSelectedCard(next);
                if (next) audioEngine.playCardActivate();
                else audioEngine.playClick();
              }}
            />
            <TacticalCard
              type="challenge"
              compact={true}
              status={selectedCard === 'challenge' ? 'active' : 'ready'}
              canActivate={!isLocked}
              onActivate={() => {
                if (isLocked) return;
                const next = selectedCard === 'challenge' ? undefined : 'challenge';
                setSelectedCard(next);
                if (next) audioEngine.playCardActivate();
                else audioEngine.playClick();
              }}
            />
          </div>
        </div>

        {/* Alliance partner selection when Alliance card is chosen */}
        {selectedCard === 'alliance' && (
          <div
            style={{
              marginTop: 8,
              padding: 10,
              background: 'rgba(216,180,109,0.06)',
              borderRadius: 8,
              border: '1px solid rgba(216,180,109,0.25)',
            }}
          >
            <label
              style={{
                fontSize: 11,
                color: 'var(--color-gold-300)',
                display: 'block',
                marginBottom: 4,
                fontFamily: 'var(--font-mono)',
              }}
            >
              ĐỐI TÁC LIÊN MINH (CẦU ĐỒNG TỒN DỊ):
            </label>
            <select
              value={allianceTarget}
              onChange={(e) => setAllianceTarget(e.target.value)}
              disabled={isLocked}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(9, 18, 14, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: 10,
                color: '#FFFFFF',
                fontFamily: 'var(--font-ui)',
                fontSize: 13.5,
                fontWeight: 600,
                outline: 'none',
              }}
            >
              {['G01', 'G02', 'G03', 'G04', 'G05', 'G06', 'G07']
                .filter((g) => g !== seat.groupId)
                .map((g) => (
                  <option key={g} value={g}>
                    {g} —{' '}
                    {g === 'G01'
                      ? 'Sen Vàng'
                      : g === 'G02'
                      ? 'Trúc Xanh'
                      : g === 'G03'
                      ? 'Cương Nhu'
                      : g === 'G04'
                      ? 'Hòa Hiếu'
                      : g === 'G05'
                      ? 'Độc Lập'
                      : g === 'G06'
                      ? 'Tự Cường'
                      : 'Đa Phương'}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Sticky action bar */}
      <div className="sticky-action">
        <Button
          variant={seat.role === 'captain' ? 'primary' : 'ghost'}
          fullWidth
          disabled={isLocked || session?.status !== 'round_open'}
          onClick={handleVoteSubmit}
        >
          {isLocked
            ? 'ĐÃ KHÓA BIỂU QUYẾT'
            : seat.role === 'captain'
            ? 'KHÓA BIỂU QUYẾT CỦA NHÓM'
            : 'GỬI Ý KIẾN DỰ THẢO CHO NHÓM TRƯỞNG'}
        </Button>

        {statusMessage && (
          <div style={{ fontSize: 12, color: 'var(--color-gold-300)', fontFamily: 'var(--font-mono)', fontWeight: 600, textAlign: 'center', marginTop: 8 }}>
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}
