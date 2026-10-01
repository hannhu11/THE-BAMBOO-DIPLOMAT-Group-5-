import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
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
import { GachaPortal } from './GachaPortal';
import { BambooGrove, BambooDivider } from './BambooDecor';

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

interface LeaderboardEntry {
  groupId: string;
  name?: string;
  rank: number;
  score: number;
  axes: {
    autonomy: number;
    economy: number;
    prestige: number;
  };
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
  const [allGroups, setAllGroups] = useState<GroupData[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Login Form
  const [teamNameInput, setTeamNameInput] = useState('');
  const [pinInput, setPinInput] = useState('HCM202');
  const [joinError, setJoinError] = useState('');
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);

  // Gacha Portal State
  // Refresh khi đang ở #/gacha thì phải quay lại đúng màn bốc thẻ (thẻ do server giữ nên không đổi)
  const [showGacha, setShowGacha] = useState(
    () => window.location.hash === '#/gacha' && !!localStorage.getItem('bamboo_token')
  );
  const [gachaCards, setGachaCards] = useState<CardType[]>([]);
  const [isDrawingGacha, setIsDrawingGacha] = useState(false);

  // Active Battle Room State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [session, setSession] = useState<any>(null);
  const [scenario, setScenario] = useState<any>(null);
  const [selectedChoice, setSelectedChoice] = useState<ChoiceLetter | undefined>(undefined);
  const [selectedCardForVote, setSelectedCardForVote] = useState<CardType | undefined>(undefined);
  const [targetTeamId, setTargetTeamId] = useState<string>('');
  const [isLocked, setIsLocked] = useState(false);
  const [remainingSec, setRemainingSec] = useState(30);
  const [serverStatus, setServerStatus] = useState('Đang kết nối...');
  const [resolutionData, setResolutionData] = useState<any>(null);

  // Modals State
  const [inspectedCard, setInspectedCard] = useState<CardType | null>(null);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  // Browser History Navigation (popstate)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const hash = window.location.hash;
      if (hash === '#/gacha') {
        setShowGacha(true);
      } else if (hash === '#/battle') {
        setShowGacha(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Đang ở màn bốc thẻ nhưng chưa có danh sách thẻ (refresh trang / bấm Back): lấy lại từ server
  useEffect(() => {
    if (showGacha && gachaCards.length === 0 && myGroup && !isDrawingGacha) {
      fetchGachaCards(myGroup.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGacha, myGroup?.id]);

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
        setAllGroups(data.groups);
        const found = data.groups.find((g: any) => g.id === seat.groupId);
        if (found) {
          setMyGroup(found);
          localStorage.setItem('bamboo_group', JSON.stringify(found));
        }
      }

      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
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
      setShowLeaderboardModal(false);
      setRemainingSec(data.durationSeconds || 30);
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
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
      // Show leaderboard automatically upon round conclusion
      setShowLeaderboardModal(true);
    });

    s.on('leaderboard.updated', (lb: LeaderboardEntry[]) => {
      if (Array.isArray(lb)) {
        setLeaderboard(lb);
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

      window.history.pushState({ step: 'gacha' }, '', '#/gacha');

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
      } else {
        // Không lấy được thẻ (ví dụ server vừa khởi động lại): vào thẳng phòng chơi thay vì kẹt ở màn trống
        setShowGacha(false);
        window.history.replaceState({ step: 'battle' }, '', '#/battle');
      }
    } catch (err) {
      console.error('Failed to draw gacha cards:', err);
      setShowGacha(false);
      window.history.replaceState({ step: 'battle' }, '', '#/battle');
    } finally {
      setIsDrawingGacha(false);
    }
  };

  // Hoàn tất vòng quay: vào phòng tác chiến
  const handleCompleteGacha = () => {
    audioEngine.playStamp();
    setShowGacha(false);
    window.history.pushState({ step: 'battle' }, '', '#/battle');
  };

  // Đổi nhóm / đăng xuất: xoá phiên đăng nhập và quay về màn nhập tên nhóm
  const handleLogout = () => {
    const ok = window.confirm(
      'Đổi nhóm sẽ thoát khỏi phòng chơi hiện tại.\nNếu nhập lại đúng tên nhóm cũ, bạn sẽ được vào lại nhóm đó. Tiếp tục?'
    );
    if (!ok) return;
    localStorage.removeItem('bamboo_token');
    localStorage.removeItem('bamboo_seat');
    localStorage.removeItem('bamboo_group');
    setShowGacha(false);
    setGachaCards([]);
    setSelectedChoice(undefined);
    setSelectedCardForVote(undefined);
    setIsLocked(false);
    setSession(null);
    setScenario(null);
    setResolutionData(null);
    setTeamNameInput('');
    setJoinError('');
    setToken(null);
    setSeat(null);
    setMyGroup(null);
    window.history.replaceState(null, '', window.location.pathname);
  };

  // Check Card Eligibility
  const isCardEligible =(cardType: CardType): { eligible: boolean; reason: string } => {
    if (!myGroup) return { eligible: false, reason: 'Chưa có thông tin nhóm' };

    // Check if card was already spent
    if (myGroup.cardStatuses?.[cardType] === 'used') {
      return { eligible: false, reason: 'Thẻ đã được kích hoạt trong trận đấu' };
    }

    // Check score threshold >= 7 (uncapped scale)
    if (
      cardType === 'break_supply' ||
      cardType === 'counter_tariff' ||
      cardType === 'submarine_cable'
    ) {
      if (myGroup.economy < 7) {
        return { eligible: false, reason: `Kinh tế (${myGroup.economy}) chưa đạt yêu cầu ≥ 7` };
      }
    } else if (
      cardType === 'di_bat_bien' ||
      cardType === 'sovereignty_shield' ||
      cardType === 'self_reliance' ||
      cardType === 'anchor'
    ) {
      if (myGroup.autonomy < 7) {
        return { eligible: false, reason: `Tự chủ (${myGroup.autonomy}) chưa đạt yêu cầu ≥ 7` };
      }
    } else if (
      cardType === 'cau_dong_ton_di' ||
      cardType === 'un_resolution' ||
      cardType === 'diplomatic_gong' ||
      cardType === 'alliance' ||
      cardType === 'challenge'
    ) {
      if (myGroup.prestige < 7) {
        return { eligible: false, reason: `Uy tín (${myGroup.prestige}) chưa đạt yêu cầu ≥ 7` };
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

  // Lock Vote Submission
  const handleLockVote = () => {
    if (!socket || !selectedChoice || !scenario || isLocked) return;

    audioEngine.playStamp();
    socket.emit('vote.lock', {
      roundId: scenario.id,
      chosenOption: selectedChoice,
      activeCard: selectedCardForVote,
      targetGroupId: selectedCardForVote === 'break_supply' ? targetTeamId || undefined : undefined,
    });
    setIsLocked(true);
  };

  // ==========================================
  // RENDER: LOGIN SCREEN (TEAM REGISTRATION)
  // ==========================================
  if (!token || !seat || !myGroup) {
    return (
      <div className="login-screen">
        <BambooGrove side="left" />
        <BambooGrove side="right" />
        <div className="login-card">
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
                TÊN NHÓM CỦA BẠN (VD: BÀN 1, TEAM NGOẠI GIAO)
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

          <BambooDivider />
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
  // RENDER: GACHA WHEEL PORTAL (VÒNG QUAY THẺ)
  // ==========================================
  if (showGacha && gachaCards.length === 0) {
    return (
      <div className="login-screen">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#4A5B53' }}>
          Đang mở lại vòng quay thẻ…
        </div>
      </div>
    );
  }

  if (showGacha) {
    return (
      <GachaPortal
        storageKey={myGroup ? `bamboo_gacha_${myGroup.id}` : undefined}
        cards={gachaCards}
        teamName={myGroup?.name || teamNameInput}
        onComplete={handleCompleteGacha}
      />
    );
  }

  // Max score for normalization in visual bars (uncapped score scale)
  const maxScoreScale = Math.max(20, myGroup.autonomy, myGroup.economy, myGroup.prestige);

  // ==========================================
  // RENDER: MAIN DESKTOP CONSOLE
  // ==========================================
  return (
    <div className="player-desktop-root">
      <BambooGrove side="left" />
      <BambooGrove side="right" />
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

          <button
            type="button"
            onClick={() => setShowLeaderboardModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              border: '1.5px solid #B8860B',
              background: '#FDF8EC',
              color: '#B8860B',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(184, 134, 11, 0.15)',
            }}
          >
            🏆 BẢNG XẾP HẠNG
          </button>

          <VolumeToggle />

          <button
            type="button"
            onClick={handleLogout}
            title="Thoát và đổi tên nhóm"
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
                  fontWeight: 800,
                  color: '#B8860B',
                }}
              >
                TỔNG ĐIỂM: {myGroup.totalScore}
              </span>
            </div>

            <h2 className="team-display-name" title={myGroup.name}>{myGroup.name}</h2>

            {/* 3 Strategic Dials (Uncapped Points) */}
            <div className="axes-dials-container">
              {/* Autonomy */}
              <div className="axis-meter">
                <div className="axis-meter-label">
                  <span style={{ color: '#0F3628' }}>TỰ CHỦ (TC)</span>
                  <div>
                    <span style={{ color: '#0F3628', fontWeight: 800 }}>{myGroup.autonomy}</span>
                    {resolutionData?.finalDelta?.autonomy !== undefined && (
                      <span className={`axis-delta-badge ${resolutionData.finalDelta.autonomy >= 0 ? 'pos' : 'neg'}`}>
                        {resolutionData.finalDelta.autonomy >= 0 ? `+${resolutionData.finalDelta.autonomy}` : resolutionData.finalDelta.autonomy}
                      </span>
                    )}
                  </div>
                </div>
                <div className="axis-bar-track">
                  <div
                    className="axis-bar-fill"
                    style={{
                      width: `${Math.min(100, (myGroup.autonomy / maxScoreScale) * 100)}%`,
                      background: 'linear-gradient(90deg, #1C5C47, #10B981)',
                    }}
                  />
                </div>
              </div>

              {/* Economy */}
              <div className="axis-meter">
                <div className="axis-meter-label">
                  <span style={{ color: '#B8860B' }}>KINH TẾ (KT)</span>
                  <div>
                    <span style={{ color: '#B8860B', fontWeight: 800 }}>{myGroup.economy}</span>
                    {resolutionData?.finalDelta?.economy !== undefined && (
                      <span className={`axis-delta-badge ${resolutionData.finalDelta.economy >= 0 ? 'pos' : 'neg'}`}>
                        {resolutionData.finalDelta.economy >= 0 ? `+${resolutionData.finalDelta.economy}` : resolutionData.finalDelta.economy}
                      </span>
                    )}
                  </div>
                </div>
                <div className="axis-bar-track">
                  <div
                    className="axis-bar-fill"
                    style={{
                      width: `${Math.min(100, (myGroup.economy / maxScoreScale) * 100)}%`,
                      background: 'linear-gradient(90deg, #B8860B, #F3CA68)',
                    }}
                  />
                </div>
              </div>

              {/* Prestige */}
              <div className="axis-meter">
                <div className="axis-meter-label">
                  <span style={{ color: '#1E40AF' }}>UY TÍN (UT)</span>
                  <div>
                    <span style={{ color: '#1E40AF', fontWeight: 800 }}>{myGroup.prestige}</span>
                    {resolutionData?.finalDelta?.prestige !== undefined && (
                      <span className={`axis-delta-badge ${resolutionData.finalDelta.prestige >= 0 ? 'pos' : 'neg'}`}>
                        {resolutionData.finalDelta.prestige >= 0 ? `+${resolutionData.finalDelta.prestige}` : resolutionData.finalDelta.prestige}
                      </span>
                    )}
                  </div>
                </div>
                <div className="axis-bar-track">
                  <div
                    className="axis-bar-fill"
                    style={{
                      width: `${Math.min(100, (myGroup.prestige / maxScoreScale) * 100)}%`,
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
              <span style={{ fontSize: 10, color: '#B8860B' }}>NHẤP ĐỂ XEM</span>
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
                      onClick={() => setInspectedCard(card)}
                      style={{
                        padding: '9px 12px',
                        borderRadius: 10,
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
                        cursor: 'pointer',
                        opacity: isSpent ? 0.6 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#0E281E' }}>
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
                            fontSize: 9.5,
                            fontFamily: 'var(--font-mono)',
                            padding: '2px 5px',
                            borderRadius: 4,
                            background: isSpent ? '#E2E8F0' : isArmedForVote ? '#B8860B' : '#EFE9DC',
                            color: isArmedForVote ? '#FFFFFF' : '#0E281E',
                            fontWeight: 700,
                          }}
                        >
                          {isSpent ? 'ĐÃ DÙNG' : isArmedForVote ? 'SẼ KÍCH HOẠT' : 'SẴN SÀNG'}
                        </span>
                      </div>

                      <div style={{ fontSize: 10.5, color: eligible ? '#4A5B53' : '#9E2A2B', lineHeight: 1.3 }}>
                        {isSpent ? 'Thẻ đã hoàn thành sứ mệnh' : eligible ? 'Chạm để xem chi tiết / gán lượt này' : reason}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ fontSize: 12, color: '#4A5B53', textAlign: 'center', padding: 12 }}>
                  Chưa có thẻ chiến lược.
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
                  <div className="scenario-principle-chip">
                    {scenario.isBlackSwan ? '⚡ KHỦNG HOẢNG THIÊN NGA ĐEN' : scenario.principle}
                  </div>
                  <h1 className="scenario-title">
                    CÂU HỎI {scenario.order}/12: {scenario.title}
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
                    {isLocked ? '✓ ĐÃ KHÓA BIỂU QUYẾT' : 'ĐANG MỞ BIỂU QUYẾT (30S)'}
                  </span>
                </div>
              </div>

              {/* Context Narrative */}
              <div className="scenario-context-box">{scenario.context}</div>

              {/* 4 Options Grid */}
              <div className="options-grid">
                {scenario.options.map((opt: any) => {
                  const isSelected = selectedChoice === opt.id;
                  const optionResolution = resolutionData?.chosenOption === opt.id;

                  return (
                    <div
                      key={opt.id}
                      className={`option-laptop-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectOption(opt.id)}
                    >
                      <div className="option-letter-badge">{opt.id}</div>

                      <div className="option-body">
                        <div className="option-title">{opt.label}</div>
                        {opt.hint && <div className="option-hint">{opt.hint}</div>}

                        {/* Stakeholder Reaction Icons */}
                        <div className="stakeholder-preview-row">
                          <div className="sigil-chip" title="Phản ứng Phương Tây">
                            <SigilWest size={16} />
                            <span>PT: Phương Tây</span>
                          </div>
                          <div className="sigil-chip" title="Phản ứng Láng Giềng">
                            <SigilNeighbor size={16} />
                            <span>LG: Láng Giềng</span>
                          </div>
                          <div className="sigil-chip" title="Phản ứng Liên Hợp Quốc">
                            <SigilUN size={16} />
                            <span>UN: LHQ</span>
                          </div>
                          <div className="sigil-chip" title="Ý Đảng Lòng Dân VN">
                            <SigilVN size={16} />
                            <span>VN: Nhân Dân</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Card Pill info (if armed) */}
              {selectedCardForVote && (
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: '#FDF8EC',
                    border: '1.5px solid #B8860B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#B8860B' }}>
                    THẺ CHIẾN LƯỢC KÍCH HOẠT KÈM: {selectedCardForVote.toUpperCase()}
                    {targetTeamId && ` (Mục tiêu: ${allGroups.find(g => g.id === targetTeamId)?.name || targetTeamId})`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCardForVote(undefined)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9E2A2B',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    HỦY GÁN ✕
                  </button>
                </div>
              )}

              {/* Action Bottom Bar */}
              <div className="action-bar-bottom">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, color: '#4A5B53' }}>
                    {selectedChoice
                      ? `Bạn đang chọn phương án: ${selectedChoice}`
                      : 'Vui lòng chọn 1 phương án tác chiến (A, B, C hoặc D)'}
                  </span>
                </div>

                <button
                  type="button"
                  className="lock-vote-btn"
                  onClick={handleLockVote}
                  disabled={!selectedChoice || isLocked || session?.status !== 'round_open'}
                >
                  {isLocked ? '✓ BIỂU QUYẾT ĐÃ KHÓA' : 'XÁC NHẬN BIỂU QUYẾT ➔'}
                </button>
              </div>

              {/* Resolution Details Panel (if round resolved) */}
              {resolutionData && (
                <div
                  style={{
                    marginTop: 16,
                    padding: '20px 24px',
                    borderRadius: 16,
                    background: resolutionData.isBalanced ? 'rgba(16, 185, 129, 0.08)' : 'rgba(184, 134, 11, 0.08)',
                    border: `1.5px solid ${resolutionData.isBalanced ? '#10B981' : '#B8860B'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        fontWeight: 800,
                        color: resolutionData.isBalanced ? '#059669' : '#B8860B',
                      }}
                    >
                      {resolutionData.isBalanced
                        ? '★ BẢN LĨNH CÂY TRE — PHƯƠNG ÁN ĐẠT CÂN BẰNG TỐI ƯU'
                        : 'KẾT QUẢ ĐIỀU CHỈNH CHỈ SỐ LƯỢT NÀY'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: '#0E281E' }}>
                      ĐIỂM TỔNG MỚI: {resolutionData.compositeScore}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700 }}>
                    <span style={{ color: '#0F3628' }}>
                      TC: {resolutionData.newState?.autonomy} ({resolutionData.finalDelta?.autonomy >= 0 ? `+${resolutionData.finalDelta?.autonomy}` : resolutionData.finalDelta?.autonomy})
                    </span>
                    <span style={{ color: '#B8860B' }}>
                      KT: {resolutionData.newState?.economy} ({resolutionData.finalDelta?.economy >= 0 ? `+${resolutionData.finalDelta?.economy}` : resolutionData.finalDelta?.economy})
                    </span>
                    <span style={{ color: '#1E40AF' }}>
                      UT: {resolutionData.newState?.prestige} ({resolutionData.finalDelta?.prestige >= 0 ? `+${resolutionData.finalDelta?.prestige}` : resolutionData.finalDelta?.prestige})
                    </span>
                  </div>

                  {resolutionData.reactions && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 6 }}>
                      {Object.entries(resolutionData.reactions).map(([stakeholder, item]: [string, any]) => (
                        <div
                          key={stakeholder}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            background: '#FFFFFF',
                            border: '1px solid #D8D0BE',
                            fontSize: 11.5,
                            color: '#0E281E',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                          }}
                        >
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#B8860B' }}>
                            {stakeholder === 'west'
                              ? 'PHƯƠNG TÂY'
                              : stakeholder === 'neighbor'
                              ? 'LÁNG GIỀNG'
                              : stakeholder === 'un'
                              ? 'LIÊN HỢP QUỐC'
                              : 'NHÂN DÂN VIỆT NAM'}
                          </span>
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                textAlign: 'center',
                color: '#4A5B53',
              }}
            >
              <BrandLogoMark size={72} />
              <h2 style={{ fontFamily: 'var(--font-display)', color: '#0E281E', margin: 0 }}>
                PHÒNG TÁC CHIẾN NGOẠI GIAO
              </h2>
              <p style={{ maxWidth: 500, fontSize: 14 }}>
                Đang chờ Quản trò (GM) phát lệnh mở câu hỏi tiếp theo. Hãy cùng đồng đội bàn luận chiến lược!
              </p>
            </div>
          )}
        </section>
      </main>

      {/* ========================================== */}
      {/* MODAL 1: CARD INSPECTION & ASSIGNMENT      */}
      {/* ========================================== */}
      {inspectedCard &&
        ReactDOM.createPortal(
          <div className="tactical-modal-overlay" onClick={() => setInspectedCard(null)}>
            <div className="tactical-modal-box" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 1.5,
                    color: '#B8860B',
                    textTransform: 'uppercase',
                  }}
                >
                  MẬT LỆNH CHIẾN LƯỢC QUỐC GIA
                </span>
                <button
                  type="button"
                  onClick={() => setInspectedCard(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 18,
                    fontWeight: 800,
                    cursor: 'pointer',
                    color: '#4A5B53',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Render Full Card */}
              <TacticalCard
                type={inspectedCard}
                status={myGroup.cardStatuses?.[inspectedCard] === 'used' ? 'spent' : 'ready'}
                canActivate={isCardEligible(inspectedCard).eligible}
              />

              {/* Requirement status text */}
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: isCardEligible(inspectedCard).eligible ? '#059669' : '#DC2626',
                  fontWeight: 700,
                  textAlign: 'center',
                }}
              >
                {isCardEligible(inspectedCard).reason}
              </div>

              {/* Target Team Selector for Attack cards */}
              {inspectedCard === 'break_supply' &&
                isCardEligible(inspectedCard).eligible &&
                myGroup.cardStatuses?.[inspectedCard] !== 'used' && (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        fontWeight: 800,
                        color: '#0E281E',
                        textTransform: 'uppercase',
                      }}
                    >
                      CHỌN ĐỘI MỤC TIÊU PHONG TỎA:
                    </label>
                    <select
                      value={targetTeamId}
                      onChange={(e) => setTargetTeamId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1.5px solid #D8D0BE',
                        background: '#FAF7F0',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#0E281E',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">-- Chọn 1 nhóm đối thủ --</option>
                      {allGroups
                        .filter((g) => g.id !== myGroup.id)
                        .map((g) => (
                          <option key={g.id} value={g.id}>
                            #{g.rank} {g.name} (Điểm: {g.totalScore})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                {myGroup.cardStatuses?.[inspectedCard] === 'used' ? (
                  <button
                    disabled
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 12,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 800,
                      background: '#E2E8F0',
                      color: '#64748B',
                      border: '1px solid #CBD5E1',
                      cursor: 'not-allowed',
                    }}
                  >
                    ĐÃ SỬ DỤNG TRONG TRẬN ĐẤU (KHÓA)
                  </button>
                ) : !isCardEligible(inspectedCard).eligible ? (
                  <button
                    disabled
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 12,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 800,
                      background: '#FEE2E2',
                      color: '#DC2626',
                      border: '1px solid #FCA5A5',
                      cursor: 'not-allowed',
                    }}
                  >
                    CHƯA ĐỦ ĐIỀU KIỆN (YÊU CẦU ĐIỂM ≥ 7)
                  </button>
                ) : (
                  <>
                    {session?.status === 'round_open' && !isLocked && (
                      <button
                        type="button"
                        disabled={
                          inspectedCard === 'break_supply' &&
                          !targetTeamId &&
                          selectedCardForVote !== inspectedCard
                        }
                        onClick={() => {
                          if (selectedCardForVote === inspectedCard) {
                            setSelectedCardForVote(undefined);
                          } else {
                            setSelectedCardForVote(inspectedCard);
                          }
                          setInspectedCard(null);
                        }}
                        style={{
                          opacity:
                            inspectedCard === 'break_supply' &&
                            !targetTeamId &&
                            selectedCardForVote !== inspectedCard
                              ? 0.5
                              : 1,
                          width: '100%',
                          padding: '14px',
                          borderRadius: 12,
                          fontFamily: 'var(--font-mono)',
                          fontSize: 13,
                          fontWeight: 800,
                          letterSpacing: 1,
                          background:
                            selectedCardForVote === inspectedCard
                              ? '#9E2A2B'
                              : 'linear-gradient(180deg, #1C5C47, #0F3628)',
                          color: '#FFFFFF',
                          border: '1.5px solid #B8860B',
                          cursor: 'pointer',
                          boxShadow: '0 6px 18px rgba(15, 54, 40, 0.25)',
                        }}
                      >
                        {selectedCardForVote === inspectedCard
                          ? 'HỦY GÁN CHO LƯỢT BIỂU QUYẾT NÀY ✕'
                          : inspectedCard === 'break_supply' && !targetTeamId
                          ? 'CHỌN ĐỘI MỤC TIÊU Ở TRÊN TRƯỚC'
                          : 'GÁN KÍCH HOẠT CHO LƯỢT BIỂU QUYẾT NÀY ✓'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setInspectedCard(null)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: 12,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        fontWeight: 700,
                        background: '#FFFFFF',
                        border: '1px solid #D8D0BE',
                        color: '#0E281E',
                        cursor: 'pointer',
                      }}
                    >
                      ĐÓNG LẠI
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ========================================== */}
      {/* MODAL 2: LIVE CLASSROOM LEADERBOARD        */}
      {/* ========================================== */}
      {showLeaderboardModal &&
        ReactDOM.createPortal(
          <div className="leaderboard-modal-overlay" onClick={() => setShowLeaderboardModal(false)}>
            <div className="leaderboard-modal-box" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EFE9DC', paddingBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <BrandLogoMark size={32} />
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#0E281E', margin: 0 }}>
                    BẢNG XẾP HẠNG TOÀN LỚP
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLeaderboardModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 20,
                    fontWeight: 800,
                    cursor: 'pointer',
                    color: '#4A5B53',
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {leaderboard.length > 0 ? (
                  leaderboard.map((item) => {
                    const isMyTeam = item.groupId === seat?.groupId;

                    return (
                      <div
                        key={item.groupId}
                        className={`leaderboard-table-item ${isMyTeam ? 'highlight-my-team' : ''}`}
                      >
                        <div style={{ fontWeight: 800, color: item.rank <= 3 ? '#B8860B' : '#4A5B53' }}>
                          #{item.rank}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: '#0E281E' }}>{item.name || item.groupId}</span>
                          {isMyTeam && (
                            <span
                              style={{
                                fontSize: 10,
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: '#B8860B',
                                color: '#FFFFFF',
                                fontWeight: 800,
                              }}
                            >
                              ĐỘI BẠN
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                          <span style={{ color: '#0F3628' }}>TC: {item.axes?.autonomy}</span>
                          <span style={{ color: '#B8860B' }}>KT: {item.axes?.economy}</span>
                          <span style={{ color: '#1E40AF' }}>UT: {item.axes?.prestige}</span>
                        </div>
                        <div style={{ fontWeight: 800, color: '#B8860B', textAlign: 'right', fontSize: 15 }}>
                          {item.score}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: 24, color: '#4A5B53', fontSize: 13 }}>
                    Chưa có dữ liệu xếp hạng. Đang cập nhật từ máy chủ...
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowLeaderboardModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    fontWeight: 700,
                    background: 'linear-gradient(180deg, #1C5C47, #0F3628)',
                    color: '#FFFFFF',
                    border: '1px solid #B8860B',
                    cursor: 'pointer',
                  }}
                >
                  TIẾP TỤC TÁC CHIẾN →
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
