import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Button,
  StatusPill,
  Timer,
  TacticalCard,
  VolumeToggle,
  audioEngine,
  BrandLogoMark,
  SigilWest,
  SigilNeighbor,
  SigilUN,
  SigilVN,
} from '@bamboo/ui-kit';
import { ChoiceLetter, CardType, Role } from '@bamboo/domain-types';

interface GroupData {
  id: string;
  name: string;
  rank: number;
  totalScore: number;
  autonomy: number;
  economy: number;
  prestige: number;
  assignedCards?: CardType[];
  cardStatuses?: Record<string, 'ready' | 'used'>;
}

interface SeatData {
  id: string;
  groupId: string;
  studentName: string;
  role: Role;
}

export function App() {
  // Authentication & Group State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('bamboo_token'));
  const [seat, setSeat] = useState<SeatData | null>(() => {
    const s = localStorage.getItem('bamboo_seat');
    return s ? JSON.parse(s) : null;
  });
  const [myGroup, setMyGroup] = useState<GroupData | null>(() => {
    const g = localStorage.getItem('bamboo_group');
    return g ? JSON.parse(g) : null;
  });

  // Login Form
  const [teamNameInput, setTeamNameInput] = useState('');
  const [pinInput, setPinInput] = useState('HCM202');
  const [joinError, setJoinError] = useState('');
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);

  // Gacha Portal State
  const [showGacha, setShowGacha] = useState(false);
  const [gachaCards, setGachaCards] = useState<CardType[]>([]);
  const [revealedCards, setRevealedCards] = useState<boolean[]>([false, false, false]);
  const [isDrawingGacha, setIsDrawingGacha] = useState(false);

  // Active Battle Room State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [session, setSession] = useState<any>(null);
  const [scenario, setScenario] = useState<any>(null);
  const [selectedChoice, setSelectedChoice] = useState<ChoiceLetter | undefined>(undefined);
  const [selectedCardForVote, setSelectedCardForVote] = useState<CardType | undefined>(undefined);
  const [isLocked, setIsLocked] = useState(false);
  const [remainingSec, setRemainingSec] = useState(45);
  const [serverStatus, setServerStatus] = useState('Đang kết nối...');
  const [resolutionData, setResolutionData] = useState<any>(null);

  // Socket Connection Effect
  useEffect(() => {
    if (!token || !seat) return;

    const s = io({
      path: '/socket.io/',
      auth: {
        token,
        seatId: seat.id,
        role: seat.role,
        groupId: seat.groupId,
      },
    });

    s.on('connect', () => {
      setServerStatus('Trực tuyến · Sẵn sàng tác chiến');
    });

    s.on('disconnect', () => {
      setServerStatus('Mất kết nối máy chủ');
    });

    s.on('session.synced', (data: any) => {
      setSession(data.session);
      setScenario(data.currentScenario);

      if (data.groups) {
        const found = data.groups.find((g: any) => g.id === seat.groupId);
        if (found) {
          setMyGroup(found);
          localStorage.setItem('bamboo_group', JSON.stringify(found));
        }
      }

      const dec = data.roundDecisions?.[seat.groupId];
      if (dec) {
        setIsLocked(dec.isLocked);
        setSelectedChoice(dec.chosenOption as ChoiceLetter);
        setSelectedCardForVote(dec.activeCard as CardType);
      } else {
        setIsLocked(false);
        setSelectedChoice(undefined);
        setSelectedCardForVote(undefined);
      }
    });

    s.on('round.opened', (data: any) => {
      audioEngine.playGong();
      setSession(data.session);
      setScenario(data.scenario);
      setSelectedChoice(undefined);
      setSelectedCardForVote(undefined);
      setIsLocked(false);
      setResolutionData(null);
      setRemainingSec(data.durationSeconds || 45);
    });

    s.on('round.locked', (data: any) => {
      audioEngine.playStamp();
      setIsLocked(true);
    });

    s.on('round.revealed', (data: any) => {
      audioEngine.playGong();
      setSession(data.session);
      const myRes = data.resolutions?.[seat.groupId];
      if (myRes) {
        setResolutionData(myRes);
      }
    });

    s.on('leaderboard.updated', (lb: any[]) => {
      if (Array.isArray(lb)) {
        const found = lb.find((item: any) => item.groupId === seat.groupId);
        if (found) {
          setMyGroup((prev) =>
            prev
              ? {
                  ...prev,
                  rank: found.rank,
                  totalScore: found.score,
                  autonomy: found.axes.autonomy,
                  economy: found.axes.economy,
                  prestige: found.axes.prestige,
                }
              : prev
          );
        }
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [token, seat?.id]);

  // Countdown timer
  useEffect(() => {
    if (session?.status !== 'round_open' || remainingSec <= 0) return;
    const interval = setInterval(() => {
      setRemainingSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.status, remainingSec]);

  // Handle Team Login
  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamNameInput.trim()) {
      setJoinError('Vui lòng nhập tên nhóm của bạn');
      return;
    }

    setIsSubmittingJoin(true);
    setJoinError('');

    try {
      const res = await fetch('/api/session/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionPin: pinInput.trim(),
          teamName: teamNameInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Không thể tham gia phòng chơi');
      }

      localStorage.setItem('bamboo_token', data.token);
      localStorage.setItem('bamboo_seat', JSON.stringify(data.seat));
      localStorage.setItem('bamboo_group', JSON.stringify(data.group));

      setToken(data.token);
      setSeat(data.seat);
      setMyGroup(data.group);

      // Trigger Gacha Portal
      fetchGachaCards(data.group.id);
    } catch (err: any) {
      setJoinError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  // Fetch or Draw Gacha Cards
  const fetchGachaCards = async (groupId: string) => {
    setIsDrawingGacha(true);
    try {
      const res = await fetch('/api/session/gacha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId }),
      });
      const data = await res.json();
      if (data.success && data.cards) {
        setGachaCards(data.cards);
        setShowGacha(true);
      }
    } catch (err) {
      console.error('Failed to draw gacha cards:', err);
    } finally {
      setIsDrawingGacha(false);
    }
  };

  // Reveal Single Gacha Card
  const handleRevealCard = (index: number) => {
    audioEngine.playCardFlip();
    setRevealedCards((prev) => {
      const copy = [...prev];
      copy[index] = true;
      return copy;
    });
  };

  // Reveal All & Finish Gacha
  const handleCompleteGacha = () => {
    audioEngine.playStamp();
    setShowGacha(false);
  };

  // Check Card Eligibility
  const isCardEligible = (cardType: CardType): { eligible: boolean; reason: string } => {
    if (!myGroup) return { eligible: false, reason: 'Chưa có thông tin nhóm' };

    // Check if card was already spent
    if (myGroup.cardStatuses?.[cardType] === 'used') {
      return { eligible: false, reason: 'Thẻ đã được kích hoạt trong trận đấu' };
    }

    // Check score threshold >= 7
    if (
      cardType === 'break_supply' ||
      cardType === 'counter_tariff' ||
      cardType === 'submarine_cable'
    ) {
      if (myGroup.economy < 7) {
        return { eligible: false, reason: `Kinh tế (${myGroup.economy}/20) chưa đạt yêu cầu ≥ 7` };
      }
    } else if (
      cardType === 'di_bat_bien' ||
      cardType === 'sovereignty_shield' ||
      cardType === 'self_reliance' ||
      cardType === 'anchor'
    ) {
      if (myGroup.autonomy < 7) {
        return { eligible: false, reason: `Tự chủ (${myGroup.autonomy}/20) chưa đạt yêu cầu ≥ 7` };
      }
    } else if (
      cardType === 'cau_dong_ton_di' ||
      cardType === 'un_resolution' ||
      cardType === 'diplomatic_gong' ||
      cardType === 'alliance' ||
      cardType === 'challenge'
    ) {
      if (myGroup.prestige < 7) {
        return { eligible: false, reason: `Uy tín (${myGroup.prestige}/20) chưa đạt yêu cầu ≥ 7` };
      }
    }

    return { eligible: true, reason: 'Đủ điều kiện kích hoạt' };
  };

  // Select Option
  const handleSelectOption = (letter: ChoiceLetter) => {
    if (isLocked || session?.status !== 'round_open') return;
    audioEngine.playCardFlip();
    setSelectedChoice(letter);
  };

  // Toggle Card for this Vote
  const handleToggleCardForVote = (card: CardType) => {
    if (isLocked || session?.status !== 'round_open') return;
    const { eligible } = isCardEligible(card);
    if (!eligible) return;

    audioEngine.playCardFlip();
    if (selectedCardForVote === card) {
      setSelectedCardForVote(undefined);
    } else {
      setSelectedCardForVote(card);
    }
  };

  // Lock Vote Submission
  const handleLockVote = () => {
    if (!socket || !selectedChoice || !scenario || isLocked) return;

    audioEngine.playStamp();
    socket.emit('vote.lock', {
      roundId: scenario.id,
      chosenOption: selectedChoice,
      activeCard: selectedCardForVote,
    });
    setIsLocked(true);
  };

  // Handle Logout / Switch Team
  const handleLogout = () => {
    localStorage.removeItem('bamboo_token');
    localStorage.removeItem('bamboo_seat');
    localStorage.removeItem('bamboo_group');
    setToken(null);
    setSeat(null);
    setMyGroup(null);
  };

  // ==========================================
  // RENDER: LOGIN SCREEN (TEAM REGISTRATION)
  // ==========================================
  if (!token || !seat || !myGroup) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#F7F4EA',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 480,
            background: '#FFFFFF',
            border: '2px solid #D8D0BE',
            borderRadius: 24,
            padding: '36px 32px',
            boxShadow: '0 12px 36px rgba(14, 40, 30, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {/* Logo & Header */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <BrandLogoMark size={64} />
            <h1
              style={{
                margin: '8px 0 2px',
                fontFamily: 'var(--font-display)',
                fontSize: 24,
                fontWeight: 800,
                color: '#0E281E',
                letterSpacing: 0.5,
              }}
            >
              THE BAMBOO DIPLOMAT
            </h1>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: '#B8860B',
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
              }}
            >
              HỆ THỐNG NGOẠI GIAO CÂY TRE · HCM202
            </div>
          </div>

          <form onSubmit={handleJoinSession} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {joinError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(158, 42, 43, 0.10)',
                  border: '1px solid #9E2A2B',
                  color: '#9E2A2B',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {joinError}
              </div>
            )}

            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#0E281E',
                  marginBottom: 8,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                TÊN NHÓM CỦA BẠN (VD: BÀN 1, TEAM SEN VÀNG)
              </label>
              <input
                type="text"
                value={teamNameInput}
                onChange={(e) => setTeamNameInput(e.target.value)}
                placeholder="Nhập tên nhóm tác chiến..."
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: 15,
                  borderRadius: 12,
                  border: '1.5px solid #D8D0BE',
                  background: '#FAF7F0',
                  color: '#0E281E',
                  fontFamily: 'var(--font-ui)',
                  outline: 'none',
                }}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#0E281E',
                  marginBottom: 8,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                MÃ PIN PHÒNG CHƠI
              </label>
              <input
                type="text"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                placeholder="Mặc định: HCM202"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: 15,
                  borderRadius: 12,
                  border: '1.5px solid #D8D0BE',
                  background: '#FAF7F0',
                  color: '#0E281E',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  letterSpacing: 2,
                  outline: 'none',
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingJoin}
              style={{
                marginTop: 8,
                padding: '16px 24px',
                fontSize: 15,
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                letterSpacing: 1.5,
                color: '#FFFFFF',
                background: 'linear-gradient(180deg, #1C5C47, #0F3628)',
                border: '1.5px solid #B8860B',
                borderRadius: 12,
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(15, 54, 40, 0.25)',
                transition: 'all 0.2s ease',
              }}
            >
              {isSubmittingJoin ? 'ĐANG KẾT NỐI...' : 'VÀO VỊ TRÍ THAM CHIẾN →'}
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: '#4A5B53',
            }}
          >
            Mỗi bàn sử dụng 1 máy tính laptop đại diện cho toàn đội
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: GACHA REVEAL PORTAL (TAM TRỤ)
  // ==========================================
  if (showGacha) {
    const allRevealed = revealedCards.every(Boolean);

    return (
      <div className="gacha-screen-overlay">
        <div className="gacha-chamber">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2,
                color: '#B8860B',
                textTransform: 'uppercase',
              }}
            >
              NGHI THỨC NGOẠI GIAO ĐẦU TRẬN
            </span>
            <h2 className="gacha-header-title">KHAI THẺ CHIẾN LƯỢC TAM TRỤ</h2>
            <p style={{ margin: 0, fontSize: 14, color: '#4A5B53', maxWidth: 640 }}>
              Đội ngũ của bạn được trao quyền tiếp nhận 3 Mật lệnh Chiến lược (1 Tấn Công, 1 Phòng Thủ, 1 Chức Năng).
              Hãy chạm vào từng phong thư niêm phong sáp đỏ để giải mã đặc ân ngoại giao!
            </p>
          </div>

          <div className="gacha-cards-trio">
            {gachaCards.map((cardType, idx) => {
              const isRevealed = revealedCards[idx];
              const categoryLabel =
                idx === 0 ? 'MẬT THƯ TẤN CÔNG (KT ≥ 7)' : idx === 1 ? 'MẬT THƯ PHÒNG THỦ (TC ≥ 7)' : 'MẬT THƯ CHỨC NĂNG (UT ≥ 7)';

              if (!isRevealed) {
                return (
                  <div key={idx} className="gacha-sealed-envelope" onClick={() => handleRevealCard(idx)}>
                    <div className="wax-seal">
                      {idx === 0 ? 'CÔNG' : idx === 1 ? 'THỦ' : 'MINH'}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800, color: '#0E281E' }}>
                      {categoryLabel}
                    </div>
                    <div style={{ fontSize: 12, color: '#B8860B', fontStyle: 'italic' }}>
                      Chạm để bóc niêm phong sáp đỏ ↻
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'center' }}>
                  <TacticalCard type={cardType} status="ready" canActivate={true} />
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            {!allRevealed && (
              <button
                type="button"
                onClick={() => setRevealedCards([true, true, true])}
                style={{
                  padding: '12px 20px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  border: '1px solid #D8D0BE',
                  background: '#FFFFFF',
                  color: '#0E281E',
                  cursor: 'pointer',
                }}
              >
                MỞ NHANH CẢ 3 THẺ
              </button>
            )}

            <button
              type="button"
              onClick={handleCompleteGacha}
              style={{
                padding: '14px 28px',
                borderRadius: 12,
                fontSize: 14,
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                letterSpacing: 1.5,
                background: 'linear-gradient(180deg, #1C5C47, #0F3628)',
                color: '#FFFFFF',
                border: '1.5px solid #B8860B',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(15, 54, 40, 0.25)',
              }}
            >
              TIẾP NHẬN MẬT LỆNH & VÀO PHÒNG TÁC CHIẾN →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: MAIN DESKTOP CONSOLE
  // ==========================================
  return (
    <div className="player-desktop-root">
      {/* Top Navbar */}
      <header className="top-navbar">
        <div className="brand-section">
          <BrandLogoMark size={36} />
          <div className="brand-badge">
            <span className="brand-title">THE BAMBOO DIPLOMAT</span>
            <span className="brand-sub">HCM202 · GIAO DIỆN TÁC CHIẾN LAPTOP</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              padding: '6px 12px',
              borderRadius: 8,
              background: '#FAF7F0',
              border: '1px solid #D8D0BE',
              color: '#0E281E',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: serverStatus.includes('Trực tuyến') ? '#10B981' : '#EF4444',
              }}
            />
            {serverStatus}
          </div>

          <VolumeToggle />

          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              border: '1px solid #D8D0BE',
              background: '#FFFFFF',
              color: '#4A5B53',
              cursor: 'pointer',
            }}
            title="Đổi tên nhóm"
          >
            ĐỔI NHÓM
          </button>
        </div>
      </header>

      {/* 2-Column Diplomatic Console */}
      <main className="diplomatic-console">
        {/* Left Column: Team Dossier & Cards Hand */}
        <aside className="sidebar-panel">
          {/* Dossier Card */}
          <div className="dossier-card">
            <div className="dossier-header">
              <span className="team-badge-tag">HẠNG #{myGroup.rank} TOÀN LỚP</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#B8860B',
                }}
              >
                TỔNG ĐIỂM: {myGroup.totalScore}
              </span>
            </div>

            <h2 className="team-display-name">{myGroup.name}</h2>

            {/* 3 Strategic Dials (Base 10 Scale, max 20) */}
            <div className="axes-dials-container">
              {/* Autonomy */}
              <div className="axis-meter">
                <div className="axis-meter-label">
                  <span style={{ color: '#0F3628' }}>TỰ CHỦ (TC)</span>
                  <span style={{ color: '#0F3628' }}>{myGroup.autonomy} / 20</span>
                </div>
                <div className="axis-bar-track">
                  <div
                    className="axis-bar-fill"
                    style={{
                      width: `${Math.min(100, (myGroup.autonomy / 20) * 100)}%`,
                      background: 'linear-gradient(90deg, #1C5C47, #10B981)',
                    }}
                  />
                </div>
              </div>

              {/* Economy */}
              <div className="axis-meter">
                <div className="axis-meter-label">
                  <span style={{ color: '#B8860B' }}>KINH TẾ (KT)</span>
                  <span style={{ color: '#B8860B' }}>{myGroup.economy} / 20</span>
                </div>
                <div className="axis-bar-track">
                  <div
                    className="axis-bar-fill"
                    style={{
                      width: `${Math.min(100, (myGroup.economy / 20) * 100)}%`,
                      background: 'linear-gradient(90deg, #B8860B, #F3CA68)',
                    }}
                  />
                </div>
              </div>

              {/* Prestige */}
              <div className="axis-meter">
                <div className="axis-meter-label">
                  <span style={{ color: '#1E40AF' }}>UY TÍN (UT)</span>
                  <span style={{ color: '#1E40AF' }}>{myGroup.prestige} / 20</span>
                </div>
                <div className="axis-bar-track">
                  <div
                    className="axis-bar-fill"
                    style={{
                      width: `${Math.min(100, (myGroup.prestige / 20) * 100)}%`,
                      background: 'linear-gradient(90deg, #1E40AF, #60A5FA)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tactical Cards Hand */}
          <div className="arsenal-panel">
            <div className="arsenal-header">
              <span>BỘ THẺ CHIẾN LƯỢC</span>
              <span style={{ fontSize: 10, color: '#B8860B' }}>DÙNG 1 LẦN</span>
            </div>

            <div className="cards-hand-list">
              {myGroup.assignedCards && myGroup.assignedCards.length > 0 ? (
                myGroup.assignedCards.map((card) => {
                  const { eligible, reason } = isCardEligible(card);
                  const isSpent = myGroup.cardStatuses?.[card] === 'used';
                  const isArmedForVote = selectedCardForVote === card;

                  return (
                    <div
                      key={card}
                      onClick={() => handleToggleCardForVote(card)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 12,
                        border: isArmedForVote
                          ? '2px solid #B8860B'
                          : isSpent
                          ? '1px solid #D8D0BE'
                          : '1px solid #D8D0BE',
                        background: isArmedForVote
                          ? '#FDF8EC'
                          : isSpent
                          ? '#F3EFE7'
                          : '#FFFFFF',
                        cursor: eligible && !isSpent && !isLocked ? 'pointer' : 'default',
                        opacity: isSpent ? 0.5 : eligible ? 1 : 0.75,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#0E281E' }}>
                          {card === 'break_supply'
                            ? 'BẺ GÃY CHUỖI CUNG ỨNG'
                            : card === 'counter_tariff'
                            ? 'ÁP ĐẶT THUẾ ĐỐI KHÁNG'
                            : card === 'submarine_cable'
                            ? 'CHIẾM LĨNH CÁP QUANG BIỂN'
                            : card === 'di_bat_bien' || card === 'anchor'
                            ? 'DĨ BẤT BIẾN, ỨNG VẠN BIẾN'
                            : card === 'sovereignty_shield'
                            ? 'VÀNH ĐAI ĐỘC LẬP'
                            : card === 'self_reliance'
                            ? 'TỰ LỰC CÁNH SINH'
                            : card === 'cau_dong_ton_di' || card === 'alliance'
                            ? 'CẦU ĐỒNG TỒN DỊ'
                            : card === 'un_resolution'
                            ? 'NGHỊ QUYẾT ĐHĐ LHQ'
                            : 'TIẾNG CHIÊNG NGOẠI GIAO'}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: 'var(--font-mono)',
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: isSpent ? '#E2E8F0' : isArmedForVote ? '#B8860B' : '#EFE9DC',
                            color: isArmedForVote ? '#FFFFFF' : '#0E281E',
                            fontWeight: 700,
                          }}
                        >
                          {isSpent ? 'ĐÃ DÙNG' : isArmedForVote ? 'SẼ KÍCH HOẠT' : 'SẴN SÀNG'}
                        </span>
                      </div>

                      <div style={{ fontSize: 11, color: eligible ? '#4A5B53' : '#9E2A2B', lineHeight: 1.4 }}>
                        {isSpent ? 'Thẻ đã hoàn thành sứ mệnh trong trận đấu' : eligible ? 'Bấm để gán kích hoạt cùng lượt biểu quyết này' : reason}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: 13, color: '#4A5B53', textAlign: 'center', padding: 12 }}>
                  Chưa có thẻ chiến lược. Vui lòng tải lại trang để bốc thẻ.
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Right Column: Scenario & Action Center */}
        <section className="action-center">
          {scenario ? (
            <>
              {/* Scenario Header */}
              <div className="scenario-header-bar">
                <div className="scenario-meta">
                  <div className="scenario-principle-chip">{scenario.principle}</div>
                  <h1 className="scenario-title">
                    KỊCH BẢN 0{scenario.order}: {scenario.title}
                  </h1>
                  <span className="scenario-citation">{scenario.citation}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <Timer
                    secondsLeft={remainingSec}
                    size="md"
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: isLocked ? '#10B981' : '#B8860B',
                    }}
                  >
                    {isLocked ? '✓ ĐÃ KHÓA BIỂU QUYẾT' : 'ĐANG MỞ BIỂU QUYẾT'}
                  </span>
                </div>
              </div>

              {/* Context Narrative */}
              <div className="scenario-context-box">{scenario.context}</div>

              {/* 4 Options Grid */}
              <div className="options-grid">
                {scenario.options.map((opt: any) => {
                  const isSelected = selectedChoice === opt.id;

                  return (
                    <div
                      key={opt.id}
                      className={`option-laptop-card ${isSelected ? 'selected' : ''} ${
                        isLocked ? 'locked' : ''
                      }`}
                      onClick={() => handleSelectOption(opt.id as ChoiceLetter)}
                    >
                      <div className="option-letter-badge">{opt.id}</div>
                      <div className="option-body">
                        <div className="option-title">{opt.label}</div>
                        <div className="option-hint">{opt.hint}</div>
                      </div>
                      {isSelected && (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 12,
                            fontWeight: 800,
                            color: '#B8860B',
                            alignSelf: 'center',
                          }}
                        >
                          {isLocked ? 'ĐÃ NỘP ✓' : 'ĐANG CHỌN'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Vote Actions & Card Confirmation */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 16,
                  borderTop: '1.5px solid rgba(14, 40, 30, 0.08)',
                }}
              >
                <div style={{ fontSize: 13, color: '#4A5B53' }}>
                  {selectedCardForVote ? (
                    <span>
                      Gán thẻ chiến lược:{' '}
                      <strong style={{ color: '#B8860B' }}>
                        {selectedCardForVote.toUpperCase()}
                      </strong>
                    </span>
                  ) : (
                    <span>Chưa chọn thẻ chiến lược (tùy chọn)</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLockVote}
                  disabled={!selectedChoice || isLocked || session?.status !== 'round_open'}
                  style={{
                    padding: '14px 28px',
                    fontSize: 14,
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: 1.5,
                    borderRadius: 12,
                    border: '1.5px solid #B8860B',
                    background:
                      !selectedChoice || isLocked
                        ? '#E2E8F0'
                        : 'linear-gradient(180deg, #1C5C47, #0F3628)',
                    color: !selectedChoice || isLocked ? '#64748B' : '#FFFFFF',
                    cursor: !selectedChoice || isLocked ? 'not-allowed' : 'pointer',
                    boxShadow:
                      !selectedChoice || isLocked
                        ? 'none'
                        : '0 6px 18px rgba(15, 54, 40, 0.25)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isLocked ? 'BIỂU QUYẾT ĐÃ KHÓA' : 'XÁC NHẬN BIỂU QUYẾT →'}
                </button>
              </div>

              {/* Result & Stakeholder Feedback when revealed */}
              {resolutionData && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 20,
                    borderRadius: 16,
                    background: '#FAF7F0',
                    border: '1.5px solid #B8860B',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(14, 40, 30, 0.08)',
                      paddingBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        fontWeight: 800,
                        color: '#B8860B',
                        letterSpacing: 1,
                      }}
                    >
                      KẾT QUẢ ĐIỀU ĐỘ NGOẠI GIAO VÒNG NÀY
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0E281E' }}>
                      Điểm mới: {resolutionData.compositeScore}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {Object.entries(resolutionData.reactions || {}).map(([key, item]: [string, any]) => (
                      <div
                        key={key}
                        style={{
                          padding: 12,
                          background: '#FFFFFF',
                          borderRadius: 10,
                          border: '1px solid #D8D0BE',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {key === 'west' ? (
                            <SigilWest size={24} />
                          ) : key === 'neighbor' ? (
                            <SigilNeighbor size={24} />
                          ) : key === 'un' ? (
                            <SigilUN size={24} />
                          ) : (
                            <SigilVN size={24} />
                          )}
                          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                            {key === 'west'
                              ? 'PHƯƠNG TÂY'
                              : key === 'neighbor'
                              ? 'LÁNG GIỀNG'
                              : key === 'un'
                              ? 'LIÊN HỢP QUỐC'
                              : 'NHÂN DÂN'}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: '#4A5B53', lineHeight: 1.4 }}>
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 400,
                textAlign: 'center',
                gap: 14,
              }}
            >
              <BrandLogoMark size={64} />
              <h3
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  color: '#0E281E',
                }}
              >
                PHÒNG CHỜ NGOẠI GIAO ĐANG MỞ
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: '#4A5B53', maxWidth: 480 }}>
                Đội ngũ của bạn đã kết nối an toàn. Hãy theo dõi màn hình chính của Quản trò (GM) và
                thảo luận chiến lược với bàn của mình trong lúc chờ vòng mới bắt đầu!
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
