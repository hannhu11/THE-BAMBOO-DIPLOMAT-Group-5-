import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import gsap from 'gsap';
import { io, Socket } from 'socket.io-client';
import {
  Button,
  StatusPill,
  Timer,
  TacticalCard,
  VolumeToggle,
  audioEngine,
  BrandLogoMark,
  AxisIcon3D,
  SigilWest,
  SigilNeighbor,
  SigilUN,
  SigilVN,
} from '@bamboo/ui-kit';
import { ChoiceLetter, CardType, Role } from '@bamboo/domain-types';
import { StrategicLuckyWheel } from './components/StrategicLuckyWheel';

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

// ==========================================
// GSAP 3D Interactive Card Envelope Component
// ==========================================
function GachaInteractiveEnvelope({
  idx,
  cardType,
  categoryLabel,
  isRevealed,
  onReveal,
}: {
  idx: number;
  cardType: CardType;
  categoryLabel: string;
  isRevealed: boolean;
  onReveal: () => void;
}) {
  const flipperRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (isRevealed) return;
    audioEngine.playCardFlip();

    const seal = sealRef.current;
    const flipper = flipperRef.current;
    const particles = particlesRef.current;

    if (seal && flipper && particles) {
      particles.innerHTML = '';
      for (let i = 0; i < 14; i++) {
        const p = document.createElement('div');
        p.className = 'wax-particle';
        particles.appendChild(p);
        const angle = (i / 14) * Math.PI * 2;
        const dist = 35 + Math.random() * 55;
        gsap.to(p, {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          opacity: 0,
          scale: Math.random() * 0.4 + 0.2,
          duration: 0.65,
          ease: 'power2.out',
        });
      }

      const tl = gsap.timeline({
        onComplete: () => {
          onReveal();
        },
      });

      tl.to(seal, {
        scale: 1.25,
        rotation: 12,
        duration: 0.15,
        ease: 'power1.out',
      })
      .to(seal, {
        scale: 0,
        opacity: 0,
        duration: 0.22,
        ease: 'power2.in',
      })
      .to(flipper, {
        rotationY: 180,
        duration: 0.75,
        ease: 'back.out(1.4)',
      }, '-=0.1');
    } else {
      onReveal();
    }
  };

  return (
    <div
      className={`gacha-interactive-card ${isRevealed ? 'flipped' : ''}`}
      onClick={handleClick}
    >
      <div ref={flipperRef} className="card-flipper">
        {/* Front Side: Sealed Wax Envelope */}
        <div className="card-face front-envelope">
          <div ref={particlesRef} className="particles-burst-container" />
          <div ref={sealRef} className="wax-seal-interactive">
            <span>{idx === 0 ? 'CÔNG' : idx === 1 ? 'THỦ' : 'MINH'}</span>
          </div>
          <div className="envelope-label">{categoryLabel}</div>
          <div className="envelope-sub">Chạm để bóc niêm phong sáp đỏ ↻</div>
        </div>

        {/* Back Side: Revealed Tactical Card */}
        <div className="card-face back-card">
          <TacticalCard type={cardType} status="ready" canActivate={true} />
        </div>
      </div>
    </div>
  );
}

function computeOptionDeltas(reactions: Record<string, any> = {}) {
  const deltas = { autonomy: 0, economy: 0, prestige: 0 };
  for (const item of Object.values(reactions)) {
    if (item && item.delta) {
      deltas.autonomy += item.delta.autonomy || 0;
      deltas.economy += item.delta.economy || 0;
      deltas.prestige += item.delta.prestige || 0;
    }
  }
  return deltas;
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
  const myGroupRef = useRef<GroupData | null>(myGroup);
  useEffect(() => {
    myGroupRef.current = myGroup;
  }, [myGroup]);

  const [allGroups, setAllGroups] = useState<GroupData[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

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
  const [targetTeamId, setTargetTeamId] = useState<string>('');
  const [isLocked, setIsLocked] = useState(false);
  const [remainingSec, setRemainingSec] = useState(30);
  const [resolutionData, setResolutionData] = useState<any>(null);

  // Modals State
  const [inspectedCard, setInspectedCard] = useState<CardType | null>(null);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  const isVotingLocked =
    isLocked ||
    session?.status === 'round_locked' ||
    session?.status === 'round_reveal' ||
    session?.status === 'final_results' ||
    remainingSec <= 0;

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
        groupName: myGroup?.name,
        studentName: seat.studentName,
      },
    });

    s.on('connect', () => {
      console.log('Player Socket connected');
    });

    s.on('disconnect', () => {
      console.log('Player Socket disconnected');
    });

    s.on('session.synced', (data: any) => {
      setSession(data.session);
      setScenario(data.currentScenario);

      const currentGroup = myGroupRef.current;
      const targetGid = seat.groupId || currentGroup?.id;
      const myName = currentGroup?.name?.toLowerCase();

      if (data.groups) {
        setAllGroups(data.groups);
        const found = data.groups.find(
          (g: any) =>
            g.id === targetGid ||
            (myName && g.name?.toLowerCase() === myName)
        );
        if (found) {
          setMyGroup(found);
          localStorage.setItem('bamboo_group', JSON.stringify(found));
        }
      }

      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
        const foundLb = data.leaderboard.find(
          (l: any) =>
            l.groupId === targetGid ||
            (myName && l.name?.toLowerCase() === myName)
        );
        if (foundLb) {
          setMyGroup((prev) => {
            if (!prev) return prev;
            const updated = {
              ...prev,
              rank: foundLb.rank,
              totalScore: foundLb.score,
              autonomy: foundLb.axes.autonomy,
              economy: foundLb.axes.economy,
              prestige: foundLb.axes.prestige,
            };
            localStorage.setItem('bamboo_group', JSON.stringify(updated));
            return updated;
          });
        }
      }

      const dec = data.roundDecisions?.[targetGid || ''];
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

      const currentGroup = myGroupRef.current;
      const targetGid = seat.groupId || currentGroup?.id;
      const myName = currentGroup?.name?.toLowerCase();

      const myRes =
        (targetGid && data.resolutions?.[targetGid]) ||
        (myName &&
          Object.values(data.resolutions || {}).find(
            (r: any) => r.groupName?.toLowerCase() === myName
          ));

      if (myRes) {
        setResolutionData(myRes);
        setMyGroup((prev) => {
          if (!prev) return prev;
          let rank = prev.rank;
          if (data.leaderboard) {
            const foundLb = data.leaderboard.find(
              (item: any) =>
                item.groupId === targetGid ||
                (prev.name && item.name?.toLowerCase() === prev.name.toLowerCase())
            );
            if (foundLb) rank = foundLb.rank;
          }
          const updated = {
            ...prev,
            rank,
            totalScore: myRes.compositeScore,
            autonomy: myRes.newState.autonomy,
            economy: myRes.newState.economy,
            prestige: myRes.newState.prestige,
          };
          localStorage.setItem('bamboo_group', JSON.stringify(updated));
          return updated;
        });
      }

      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
        const foundLb = data.leaderboard.find(
          (item: any) =>
            item.groupId === targetGid ||
            (myName && item.name?.toLowerCase() === myName)
        );
        if (foundLb && !myRes) {
          setMyGroup((prev) => {
            if (!prev) return prev;
            const updated = {
              ...prev,
              rank: foundLb.rank,
              totalScore: foundLb.score,
              autonomy: foundLb.axes.autonomy,
              economy: foundLb.axes.economy,
              prestige: foundLb.axes.prestige,
            };
            localStorage.setItem('bamboo_group', JSON.stringify(updated));
            return updated;
          });
        }
      }

      if (data.groups) {
        setAllGroups(data.groups);
        const foundG = data.groups.find(
          (g: any) =>
            g.id === targetGid ||
            (myName && g.name?.toLowerCase() === myName)
        );
        if (foundG) {
          setMyGroup(foundG);
          localStorage.setItem('bamboo_group', JSON.stringify(foundG));
        }
      }

      // Keep focus on battlefield so players can study the disclosed option scores & stakeholder breakdown
      // Players can view leaderboard anytime via the prominent header or banner button
    });

    s.on('leaderboard.updated', (lb: LeaderboardEntry[]) => {
      if (Array.isArray(lb)) {
        setLeaderboard(lb);
        const currentGroup = myGroupRef.current;
        const targetGid = seat.groupId || currentGroup?.id;
        const myName = currentGroup?.name?.toLowerCase();

        const found = lb.find(
          (item: any) =>
            item.groupId === targetGid ||
            (myName && item.name?.toLowerCase() === myName)
        );
        if (found) {
          setMyGroup((prev) => {
            if (!prev) return prev;
            const updated = {
              ...prev,
              rank: found.rank,
              totalScore: found.score,
              autonomy: found.axes.autonomy,
              economy: found.axes.economy,
              prestige: found.axes.prestige,
            };
            localStorage.setItem('bamboo_group', JSON.stringify(updated));
            return updated;
          });
        }
      }
    });

    s.on('group.state.updated', (grp: any) => {
      const currentGroup = myGroupRef.current;
      const targetGid = seat.groupId || currentGroup?.id;
      const myName = currentGroup?.name?.toLowerCase();

      if (
        grp &&
        (grp.id === targetGid ||
          (myName && grp.name?.toLowerCase() === myName))
      ) {
        setMyGroup(grp);
        localStorage.setItem('bamboo_group', JSON.stringify(grp));
      }
    });

    s.on('error.lock', (err: any) => {
      console.warn('Error locking vote:', err);
      setIsLocked(false);
      alert(err.message || 'Lỗi khóa biểu quyết');
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [token, seat?.id]);

  // Countdown timer
  useEffect(() => {
    if (session?.status !== 'round_open') return;
    const interval = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.status, session?.currentRound]);

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
        setMyGroup((prev) => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            assignedCards: data.cards,
            cardStatuses: prev.cardStatuses || {
              [data.cards[0]]: 'ready',
              [data.cards[1]]: 'ready',
              [data.cards[2]]: 'ready',
            },
          };
          localStorage.setItem('bamboo_group', JSON.stringify(updated));
          return updated;
        });
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
    setMyGroup((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        assignedCards: gachaCards.length ? gachaCards : prev.assignedCards,
      };
      localStorage.setItem('bamboo_group', JSON.stringify(updated));
      return updated;
    });
    setShowGacha(false);
    window.history.pushState({ step: 'battle' }, '', '#/battle');
  };

  // Check Card Eligibility
  const isCardEligible = (cardType: CardType): { eligible: boolean; reason: string } => {
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
    if (isLocked || session?.status !== 'round_open' || remainingSec <= 0) return;
    audioEngine.playCardFlip();
    setSelectedChoice(letter);
  };

  // Lock Vote Submission
  const handleLockVote = () => {
    if (!socket || !selectedChoice || !scenario || isLocked || session?.status !== 'round_open' || remainingSec <= 0) return;

    audioEngine.playStamp();
    socket.emit('vote.lock', {
      roundId: scenario.id,
      chosenOption: selectedChoice,
      activeCard: selectedCardForVote,
      targetGroupId: targetTeamId || undefined,
    });
    setIsLocked(true);
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
  // RENDER: GACHA STRATEGIC LUCKY WHEEL PORTAL
  // ==========================================
  if (showGacha) {
    return (
      <StrategicLuckyWheel
        assignedCards={gachaCards}
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
            BẢNG XẾP HẠNG
          </button>

          <VolumeToggle />
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AxisIcon3D axis="tc" size={26} variant="3d" />
                    <span style={{ color: '#0F3628' }}>TỰ CHỦ (TC)</span>
                  </div>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AxisIcon3D axis="kt" size={26} variant="3d" />
                    <span style={{ color: '#B8860B' }}>KINH TẾ (KT)</span>
                  </div>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AxisIcon3D axis="ut" size={26} variant="3d" />
                    <span style={{ color: '#1E40AF' }}>UY TÍN (UT)</span>
                  </div>
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
                        padding: '10px 12px',
                        borderRadius: 12,
                        border: isArmedForVote
                          ? '2px solid #B8860B'
                          : isSpent
                          ? '1px solid #D8D0BE'
                          : '1.5px solid #D8D0BE',
                        background: isArmedForVote
                          ? '#FDF8EC'
                          : isSpent
                          ? '#F3EFE7'
                          : '#FFFFFF',
                        cursor: 'pointer',
                        opacity: isSpent ? 0.6 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        boxShadow: isArmedForVote ? '0 4px 14px rgba(184, 134, 11, 0.2)' : '0 1px 3px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                          <span
                            style={{
                              fontSize: 9,
                              fontFamily: 'var(--font-mono)',
                              padding: '2px 5px',
                              borderRadius: 4,
                              background:
                                card === 'break_supply' || card === 'counter_tariff' || card === 'submarine_cable'
                                  ? '#5C4314'
                                  : card === 'di_bat_bien' || card === 'sovereignty_shield' || card === 'self_reliance' || card === 'anchor'
                                  ? '#0F3628'
                                  : '#183756',
                              color: '#FBF8EE',
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {card === 'break_supply' || card === 'counter_tariff' || card === 'submarine_cable'
                              ? 'CÔNG'
                              : card === 'di_bat_bien' || card === 'sovereignty_shield' || card === 'self_reliance' || card === 'anchor'
                              ? 'THỦ'
                              : 'MINH'}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 800, color: '#0E281E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                        </div>
                        <span
                          style={{
                            fontSize: 9,
                            fontFamily: 'var(--font-mono)',
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: isSpent ? '#E2E8F0' : isArmedForVote ? '#B8860B' : '#EFE9DC',
                            color: isArmedForVote ? '#FFFFFF' : '#0E281E',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {isSpent ? 'ĐÃ DÙNG' : isArmedForVote ? 'SẼ KÍCH HOẠT' : 'SẴN SÀNG'}
                        </span>
                      </div>

                      <div style={{ fontSize: 10.5, color: eligible ? '#4A5B53' : '#9E2A2B', lineHeight: 1.35 }}>
                        {isSpent ? 'Thẻ đã hoàn thành sứ mệnh trong trận đấu' : eligible ? 'Chạm để xem điển tích / gán lượt này ↻' : reason}
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
                    {scenario.isBlackSwan ? 'KHỦNG HOẢNG THIÊN NGA ĐEN' : scenario.principle}
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
                      color: isLocked ? '#10B981' : remainingSec <= 0 ? '#9E2A2B' : '#B8860B',
                    }}
                  >
                    {isLocked
                      ? '✓ ĐÃ KHÓA BIỂU QUYẾT'
                      : remainingSec <= 0
                      ? 'HẾT GIỜ BIỂU QUYẾT'
                      : 'ĐANG MỞ BIỂU QUYẾT (30S)'}
                  </span>
                </div>
              </div>

              {/* Context Narrative */}
              <div className="scenario-context-box">{scenario.context}</div>

              {/* Locked Disclosure Banner */}
              {isVotingLocked && (
                <div className="player-locked-disclosure-banner">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="disclosure-badge-pulse">📢 CÔNG KHAI ĐIỂM SỐ</span>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0E281E', fontSize: 13.5 }}>
                        BIỂU QUYẾT ĐÃ KHÓA · BẢNG PHÂN BỔ ĐIỂM CHIẾN LƯỢC VÀ PHẢN ỨNG QUỐC TẾ
                      </div>
                      <div style={{ color: '#4A5B53', fontSize: 12, marginTop: 2 }}>
                        Mỗi phương án đem lại tác động chiến lược khác nhau trên 3 trục: Tự Chủ (TC), Kinh Tế (KT), Uy Tín (UT). Hãy phân tích kỹ các phản ứng bên dưới!
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-open-leaderboard-pill"
                    onClick={() => setShowLeaderboardModal(true)}
                  >
                    🏆 BẢNG XẾP HẠNG TOÀN LỚP ➔
                  </button>
                </div>
              )}

              {/* 4 Options Grid */}
              <div className="options-grid">
                {scenario.options.map((opt: any) => {
                  const isSelected = selectedChoice === opt.id;
                  const optionResolution = resolutionData?.chosenOption === opt.id;
                  const deltas = computeOptionDeltas(opt.reactions);

                  return (
                    <div
                      key={opt.id}
                      className={`option-laptop-card ${isSelected ? 'selected' : ''} ${isVotingLocked && opt.isBalanced ? 'balanced-revealed' : ''}`}
                      onClick={() => handleSelectOption(opt.id)}
                    >
                      <div className="option-letter-badge">{opt.id}</div>

                      <div className="option-body">
                        <div className="option-title">{opt.label}</div>
                        {opt.hint && <div className="option-hint">{opt.hint}</div>}

                        {/* Option Impact Matrix (TC, KT, UT deltas) on Locked Round */}
                        {isVotingLocked && (
                          <div className="player-option-impact-matrix">
                            <div className="player-impact-header">
                              <span className="player-impact-title">PHÂN BỔ ĐIỂM:</span>
                              <div className="player-impact-pills">
                                <span className={`player-impact-badge tc ${deltas.autonomy >= 0 ? 'pos' : 'neg'}`}>
                                  <AxisIcon3D axis="tc" size={14} variant="vector" /> TC: {deltas.autonomy > 0 ? `+${deltas.autonomy}` : deltas.autonomy}
                                </span>
                                <span className={`player-impact-badge kt ${deltas.economy >= 0 ? 'pos' : 'neg'}`}>
                                  <AxisIcon3D axis="kt" size={14} variant="vector" /> KT: {deltas.economy > 0 ? `+${deltas.economy}` : deltas.economy}
                                </span>
                                <span className={`player-impact-badge ut ${deltas.prestige >= 0 ? 'pos' : 'neg'}`}>
                                  <AxisIcon3D axis="ut" size={14} variant="vector" /> UT: {deltas.prestige > 0 ? `+${deltas.prestige}` : deltas.prestige}
                                </span>
                                {opt.isBalanced && (
                                  <span className="player-balanced-pill">🌿 CHIẾN LƯỢC TOÀN DIỆN CÂN BẰNG</span>
                                )}
                              </div>
                            </div>

                            {/* Stakeholder Reactions Breakdown */}
                            {opt.reactions && (
                              <div className="player-stakeholder-disclosure-list">
                                <div className="disclosure-subheading">CHI TIẾT PHẢN ỨNG CỦA 4 BÊN LIÊN QUAN:</div>
                                <div className="disclosure-grid">
                                  {opt.reactions.west && (
                                    <div className="disclosure-item west">
                                      <div className="item-actor">🏛️ Phương Tây & FDI</div>
                                      <div className="item-text">{opt.reactions.west.text}</div>
                                      <div className="item-delta">
                                        Δ TC: {opt.reactions.west.delta.autonomy > 0 ? `+${opt.reactions.west.delta.autonomy}` : opt.reactions.west.delta.autonomy} | 
                                        KT: {opt.reactions.west.delta.economy > 0 ? `+${opt.reactions.west.delta.economy}` : opt.reactions.west.delta.economy} | 
                                        UT: {opt.reactions.west.delta.prestige > 0 ? `+${opt.reactions.west.delta.prestige}` : opt.reactions.west.delta.prestige}
                                      </div>
                                    </div>
                                  )}
                                  {opt.reactions.neighbor && (
                                    <div className="disclosure-item neighbor">
                                      <div className="item-actor">🌏 Láng giềng & Khu vực</div>
                                      <div className="item-text">{opt.reactions.neighbor.text}</div>
                                      <div className="item-delta">
                                        Δ TC: {opt.reactions.neighbor.delta.autonomy > 0 ? `+${opt.reactions.neighbor.delta.autonomy}` : opt.reactions.neighbor.delta.autonomy} | 
                                        KT: {opt.reactions.neighbor.delta.economy > 0 ? `+${opt.reactions.neighbor.delta.economy}` : opt.reactions.neighbor.delta.economy} | 
                                        UT: {opt.reactions.neighbor.delta.prestige > 0 ? `+${opt.reactions.neighbor.delta.prestige}` : opt.reactions.neighbor.delta.prestige}
                                      </div>
                                    </div>
                                  )}
                                  {opt.reactions.un && (
                                    <div className="disclosure-item un">
                                      <div className="item-actor">🇺🇳 Liên Hợp Quốc & Pháp lý</div>
                                      <div className="item-text">{opt.reactions.un.text}</div>
                                      <div className="item-delta">
                                        Δ TC: {opt.reactions.un.delta.autonomy > 0 ? `+${opt.reactions.un.delta.autonomy}` : opt.reactions.un.delta.autonomy} | 
                                        KT: {opt.reactions.un.delta.economy > 0 ? `+${opt.reactions.un.delta.economy}` : opt.reactions.un.delta.economy} | 
                                        UT: {opt.reactions.un.delta.prestige > 0 ? `+${opt.reactions.un.delta.prestige}` : opt.reactions.un.delta.prestige}
                                      </div>
                                    </div>
                                  )}
                                  {opt.reactions.vn_people && (
                                    <div className="disclosure-item vn_people">
                                      <div className="item-actor">🇻🇳 Nhân dân trong nước</div>
                                      <div className="item-text">{opt.reactions.vn_people.text}</div>
                                      <div className="item-delta">
                                        Δ TC: {opt.reactions.vn_people.delta.autonomy > 0 ? `+${opt.reactions.vn_people.delta.autonomy}` : opt.reactions.vn_people.delta.autonomy} | 
                                        KT: {opt.reactions.vn_people.delta.economy > 0 ? `+${opt.reactions.vn_people.delta.economy}` : opt.reactions.vn_people.delta.economy} | 
                                        UT: {opt.reactions.vn_people.delta.prestige > 0 ? `+${opt.reactions.vn_people.delta.prestige}` : opt.reactions.vn_people.delta.prestige}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
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

              {/* Redesigned Action Bottom Bar */}
              <div className="action-bar-bottom">
                <div className="vote-choice-display">
                  {selectedChoice ? (
                    <div className="selected-choice-badge">
                      <div className="choice-medallion">{selectedChoice}</div>
                      <div className="choice-info-text">
                        <span className="choice-sub-tag">PHƯƠNG ÁN ĐÃ CHỌN</span>
                        <span className="choice-title-preview">
                          {scenario.options.find((o: any) => o.id === selectedChoice)?.label || `Phương án ${selectedChoice}`}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="choice-empty-prompt">
                      <span className="choice-dot-pulse" />
                      <span>Vui lòng chọn 1 phương án tác chiến (A, B, C hoặc D)</span>
                    </div>
                  )}
                </div>

                <div className="vote-button-wrapper">
                  {remainingSec <= 0 && !isLocked ? (
                    <div className="vote-expired-pill">
                      <span>ĐÃ HẾT THỜI GIAN (ĐÓNG BỎ PHIẾU)</span>
                    </div>
                  ) : isLocked ? (
                    <div className="vote-locked-pill">
                      <span>✓ BIỂU QUYẾT ĐÃ KHÓA NIÊM PHONG</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="lock-vote-btn"
                      onClick={handleLockVote}
                      disabled={!selectedChoice || session?.status !== 'round_open' || remainingSec <= 0}
                    >
                      <span>XÁC NHẬN BIỂU QUYẾT</span>
                      <span className="btn-arrow">➔</span>
                    </button>
                  )}
                </div>
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

              {/* Target Team Selector only when round is actively open and card requires targeting */}
              {session?.status === 'round_open' &&
                !isLocked &&
                (inspectedCard === 'break_supply' ||
                  inspectedCard === 'cau_dong_ton_di' ||
                  inspectedCard === 'alliance' ||
                  inspectedCard === 'submarine_cable') &&
                isCardEligible(inspectedCard).eligible &&
                myGroup.cardStatuses?.[inspectedCard] !== 'used' && (
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      background: '#FAF7F0',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1.5px solid #D8D0BE',
                      boxSizing: 'border-box',
                    }}
                  >
                    <label
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        fontWeight: 800,
                        color: inspectedCard === 'break_supply' ? '#9E2A2B' : '#0E281E',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span style={{ color: '#B8860B', fontWeight: 800 }}>[MỤC TIÊU]</span>
                      {inspectedCard === 'break_supply'
                        ? 'CHỌN ĐỘI ĐỐI THỦ PHONG TỎA (ĐÓNG BĂNG THẺ BÀI):'
                        : inspectedCard === 'cau_dong_ton_di' || inspectedCard === 'alliance'
                        ? 'CHỌN ĐỘI ĐỐI TÁC CÙNG LIÊN MINH:'
                        : 'CHỌN ĐỘI CẠNH TRANH HẠ TẦNG SỐ (TÙY CHỌN):'}
                    </label>
                    <select
                      value={targetTeamId}
                      onChange={(e) => setTargetTeamId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border:
                          !targetTeamId &&
                          (inspectedCard === 'break_supply' ||
                            inspectedCard === 'cau_dong_ton_di' ||
                            inspectedCard === 'alliance')
                            ? '2px solid #DC2626'
                            : '1.5px solid #D8D0BE',
                        background: '#FFFFFF',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#0E281E',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="">
                        {inspectedCard === 'break_supply'
                          ? '-- Bắt buộc: Chọn 1 nhóm đối thủ để phong tỏa --'
                          : inspectedCard === 'cau_dong_ton_di' || inspectedCard === 'alliance'
                          ? '-- Bắt buộc: Chọn 1 nhóm đối tác liên minh --'
                          : '-- Tùy chọn: Chọn 1 nhóm đối thủ --'}
                      </option>
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
                    CHƯA ĐỦ ĐIỀU KIỆN (YÊU CẦU ĐIỂM TƯƠNG ỨNG ≥ 7)
                  </button>
                ) : (
                  <>
                    {session?.status === 'round_open' && !isLocked ? (
                      (() => {
                        const requiresTarget =
                          inspectedCard === 'break_supply' ||
                          inspectedCard === 'cau_dong_ton_di' ||
                          inspectedCard === 'alliance';
                        const isMissingTarget = requiresTarget && !targetTeamId;
                        const isCurrentlyArmed = selectedCardForVote === inspectedCard;

                        if (!isCurrentlyArmed && isMissingTarget) {
                          return (
                            <button
                              type="button"
                              disabled
                              style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: 12,
                                fontFamily: 'var(--font-mono)',
                                fontSize: 13,
                                fontWeight: 800,
                                background: '#FEF3C7',
                                color: '#92400E',
                                border: '1.5px dashed #F59E0B',
                                cursor: 'not-allowed',
                              }}
                            >
                              ⚠ VUI LÒNG CHỌN ĐỘI MỤC TIÊU PHÍA TRÊN ĐỂ GÁN THẺ
                            </button>
                          );
                        }

                        return (
                          <button
                            type="button"
                            onClick={() => {
                              if (isCurrentlyArmed) {
                                setSelectedCardForVote(undefined);
                              } else {
                                setSelectedCardForVote(inspectedCard);
                              }
                              setInspectedCard(null);
                            }}
                            style={{
                              width: '100%',
                              padding: '14px',
                              borderRadius: 12,
                              fontFamily: 'var(--font-mono)',
                              fontSize: 13,
                              fontWeight: 800,
                              letterSpacing: 1,
                              background: isCurrentlyArmed
                                ? '#9E2A2B'
                                : 'linear-gradient(180deg, #1C5C47, #0F3628)',
                              color: '#FFFFFF',
                              border: '1.5px solid #B8860B',
                              cursor: 'pointer',
                              boxShadow: '0 6px 18px rgba(15, 54, 40, 0.25)',
                            }}
                          >
                            {isCurrentlyArmed
                              ? 'HỦY GÁN CHO LƯỢT BIỂU QUYẾT NÀY ✕'
                              : '✓ GÁN KÍCH HOẠT CHO LƯỢT BIỂU QUYẾT NÀY'}
                          </button>
                        );
                      })()
                    ) : (
                      <div
                        style={{
                          padding: '12px 14px',
                          borderRadius: 10,
                          background: '#F0FDF4',
                          border: '1.5px solid #86EFAC',
                          color: '#166534',
                          fontSize: 12.5,
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          textAlign: 'center',
                        }}
                      >
                        ✓ THẺ ĐÃ SẴN SÀNG · Hãy gán kích hoạt khi Quản trò (GM) mở lượt biểu quyết
                      </div>
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
