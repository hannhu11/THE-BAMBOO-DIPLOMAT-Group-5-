import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Timer,
  VolumeToggle,
  audioEngine,
  BrandLogoMark,
  SigilWest,
  SigilNeighbor,
  SigilUN,
  SigilVN,
} from '@bamboo/ui-kit';
import scenariosData from '../../../content/scenarios.json';
import blackSwanData from '../../../content/black_swan.json';

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
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('bamboo_gm_token'));
  const [gmPassword, setGmPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Live Game State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [session, setSession] = useState<any>(null);
  const [scenario, setScenario] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [roundDecisions, setRoundDecisions] = useState<Record<string, any>>({});
  const [remainingSec, setRemainingSec] = useState(30);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('sc1');
  const [activeBlackSwan, setActiveBlackSwan] = useState<any>(null);
  const [resolutions, setResolutions] = useState<any>(null);

  const scenariosList = scenariosData.scenarios;
  const blackSwanList = blackSwanData.events;

  // Socket Connection Effect
  useEffect(() => {
    if (!token) return;

    const s = io({
      path: '/socket.io/',
      auth: {
        token,
        role: 'gm',
        actorId: 'gm_console',
      },
    });

    s.on('connect', () => {
      console.log('GM Socket connected');
    });

    s.on('session.synced', (data: any) => {
      setSession(data.session);
      setScenario(data.currentScenario);
      if (data.currentScenario) {
        setSelectedScenarioId(data.currentScenario.id);
      }
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
      if (data.roundDecisions) {
        setRoundDecisions(data.roundDecisions);
      }
    });

    s.on('round.opened', (data: any) => {
      audioEngine.playGong();
      setSession(data.session);
      setScenario(data.scenario);
      if (data.scenario) setSelectedScenarioId(data.scenario.id);
      setRemainingSec(data.durationSeconds || 30);
      setRoundDecisions({});
      setResolutions(null);
      setActiveBlackSwan(null);
    });

    s.on('round.locked', (data: any) => {
      audioEngine.playStamp();
      setSession(data.session);
    });

    s.on('round.revealed', (data: any) => {
      audioEngine.playGong();
      setSession(data.session);
      setResolutions(data.resolutions);
      if (data.leaderboard) setLeaderboard(data.leaderboard);
    });

    s.on('leaderboard.updated', (lb: LeaderboardEntry[]) => {
      if (Array.isArray(lb)) {
        setLeaderboard(lb);
      }
    });

    s.on('group.decision.locked', (data: any) => {
      audioEngine.playStamp();
      setRoundDecisions((prev) => ({
        ...prev,
        [data.groupId]: {
          chosenOption: data.chosenOption,
          isLocked: true,
          activeCard: data.activeCard,
        },
      }));
    });

    s.on('black_swan.applied', (outcome: any) => {
      audioEngine.playSiren();
      setActiveBlackSwan(outcome.event);
      if (outcome.leaderboard) {
        setLeaderboard(outcome.leaderboard);
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [token]);

  // Countdown timer
  useEffect(() => {
    if (session?.status !== 'round_open' || remainingSec <= 0) return;
    const interval = setInterval(() => {
      setRemainingSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.status, remainingSec]);

  // Handle Login
  const handleGmLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/gm/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: gmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Mật khẩu GM không đúng');

      localStorage.setItem('bamboo_gm_token', data.token);
      setToken(data.token);
    } catch (err: any) {
      setLoginError(err.message || 'Lỗi đăng nhập');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // GM Actions
  const handleOpenRound = async () => {
    try {
      const res = await fetch('/api/gm/round/open', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scenarioId: selectedScenarioId,
          durationSeconds: 30,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Lỗi mở biểu quyết');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextRound = async () => {
    try {
      const res = await fetch('/api/gm/round/next', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Lỗi chuyển câu hỏi tiếp theo');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLockRound = async () => {
    try {
      const res = await fetch('/api/gm/round/lock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roundId: scenario?.id || selectedScenarioId,
          force: true,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Lỗi khóa biểu quyết');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevealRound = async () => {
    try {
      const res = await fetch('/api/gm/round/reveal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Lỗi công bố điểm');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerBlackSwan = async () => {
    const curOrder = scenario?.order || 1;
    const targetEvent = blackSwanList[curOrder - 1] || blackSwanList[0];
    if (!targetEvent) return;

    try {
      const res = await fetch('/api/gm/black-swan/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId: targetEvent.id }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Lỗi kích hoạt Thiên Nga Đen');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetSession = async () => {
    if (!confirm('Bạn có chắc chắn muốn đặt lại toàn bộ trận đấu về trạng thái ban đầu?')) return;
    try {
      const res = await fetch('/api/gm/session/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        alert('Đã đặt lại trận đấu thành công!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bamboo_gm_token');
    setToken(null);
  };

  // ==========================================
  // RENDER: GM LOGIN SCREEN
  // ==========================================
  if (!token) {
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
            maxWidth: 440,
            background: '#FFFFFF',
            border: '2px solid #D8D0BE',
            borderRadius: 24,
            padding: '36px 32px',
            boxShadow: '0 12px 36px rgba(14, 40, 30, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
          }}
        >
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <BrandLogoMark size={64} />
            <h1 style={{ margin: '8px 0 2px', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#0E281E' }}>
              QUẢN TRÒ (GM) CONSOLE
            </h1>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#B8860B', fontWeight: 700, letterSpacing: 1.5 }}>
              MÀN CHIẾU LỚP HỌC TRUNG TÂM · THE BAMBOO DIPLOMAT
            </span>
          </div>

          <form onSubmit={handleGmLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {loginError && (
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
                {loginError}
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
                }}
              >
                MẬT KHẨU QUẢN TRÒ (GM)
              </label>
              <input
                type="password"
                value={gmPassword}
                onChange={(e) => setGmPassword(e.target.value)}
                placeholder="Nhập mật khẩu GM..."
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

            <button
              type="submit"
              disabled={isLoggingIn}
              style={{
                marginTop: 8,
                padding: '16px 24px',
                fontSize: 14,
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                letterSpacing: 1.5,
                color: '#FFFFFF',
                background: 'linear-gradient(180deg, #1C5C47, #0F3628)',
                border: '1.5px solid #B8860B',
                borderRadius: 12,
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(15, 54, 40, 0.25)',
              }}
            >
              {isLoggingIn ? 'ĐANG XÁC THỰC...' : 'MỞ BÀN ĐIỀU KHIỂN & MÀN CHIẾU →'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active scenario data to display
  const activeDisplayScenario =
    scenario || (scenariosList as any[]).find((s: any) => s.id === selectedScenarioId) || scenariosList[0];

  const lockedCount = Object.values(roundDecisions).filter((d: any) => d.isLocked).length;
  const totalTeams = leaderboard.length || 7;

  // ==========================================
  // RENDER: CLASSROOM PROJECTOR SPLIT-SCREEN
  // ==========================================
  return (
    <div className="gm-projector-stage">
      {/* Top Header */}
      <header className="gm-header">
        <div className="gm-brand-group">
          <BrandLogoMark size={40} />
          <div className="gm-title-badge">
            <span className="gm-main-title">THE BAMBOO DIPLOMAT — BẢN LĨNH NGOẠI GIAO CÂY TRE</span>
            <span className="gm-sub-title">MÀN CHIẾU TRUNG TÂM LỚP HỌC · HỌC PHẦN HCM202</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              background: '#FAF7F0',
              border: '1px solid #D8D0BE',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              fontWeight: 800,
              color: session?.status === 'round_open' ? '#10B981' : '#B8860B',
            }}
          >
            TRẠNG THÁI:{' '}
            {session?.status === 'round_open'
              ? 'ĐANG MỞ BIỂU QUYẾT'
              : session?.status === 'round_locked'
              ? 'ĐÃ KHÓA BIỂU QUYẾT'
              : session?.status === 'round_reveal'
              ? 'ĐÃ CÔNG BỐ KẾT QUẢ'
              : 'PHÒNG CHỜ NGOẠI GIAO'}
          </div>

          <VolumeToggle />

          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              border: '1px solid #D8D0BE',
              background: '#FFFFFF',
              color: '#4A5B53',
              cursor: 'pointer',
            }}
          >
            ĐĂNG XUẤT
          </button>
        </div>
      </header>

      {/* Split Grid: 65% Left (Question Board), 35% Right (Live Leaderboard) */}
      <div className="gm-split-grid">
        {/* Left 65%: Live Question Board for Lecturer & Classroom */}
        <section className="gm-question-board">
          {activeDisplayScenario && (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="gm-scenario-tag">{activeDisplayScenario.principle}</span>
                  <h1 className="gm-scenario-headline">
                    KỊCH BẢN 0{activeDisplayScenario.order}: {activeDisplayScenario.title}
                  </h1>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#76887F' }}>
                    {activeDisplayScenario.citation}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <Timer
                    secondsLeft={remainingSec}
                    size="lg"
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 800,
                      color: '#B8860B',
                    }}
                  >
                    TIẾN ĐỘ: {lockedCount}/{totalTeams} NHÓM ĐÃ NỘP
                  </span>
                </div>
              </div>

              {/* Context */}
              <div className="gm-scenario-context">
                {activeDisplayScenario.context}
              </div>

              {/* 4 Options Grid */}
              <div className="gm-options-column">
                {activeDisplayScenario.options.map((opt: any) => {
                  return (
                    <div key={opt.id} className="gm-projector-option">
                      <div className="gm-option-letter">{opt.id}</div>
                      <div className="gm-option-content">
                        <div className="gm-option-title">{opt.label}</div>
                        <div className="gm-option-hint">{opt.hint}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hồ Chí Minh Wisdom Banner */}
              <div
                style={{
                  background: '#FDFBF7',
                  border: '1px solid #D8D0BE',
                  borderRadius: 14,
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: 1.5,
                    color: '#B8860B',
                    textTransform: 'uppercase',
                  }}
                >
                  DI SẢN TƯ TƯỞNG HỒ CHÍ MINH
                </span>
                <p style={{ margin: 0, fontSize: 14.5, fontStyle: 'italic', color: '#0E281E', lineHeight: 1.5 }}>
                  « {activeDisplayScenario.wisdom?.quote} »
                </p>
                <span style={{ fontSize: 12, color: '#76887F', fontFamily: 'var(--font-mono)' }}>
                  — {activeDisplayScenario.wisdom?.source}
                </span>
              </div>
            </>
          )}

          {/* Black Swan Alert Banner if active */}
          {activeBlackSwan && (
            <div
              style={{
                padding: '16px 20px',
                borderRadius: 14,
                background: 'rgba(158, 42, 43, 0.08)',
                border: '2px solid #9E2A2B',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9E2A2B', fontWeight: 800 }}>
                <span>⚠ KHỦNG HOẢNG THIÊN NGA ĐEN ĐÃ KÍCH HOẠT:</span>
                <span>{activeBlackSwan.title}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13.5, color: '#0E281E', lineHeight: 1.5 }}>
                {activeBlackSwan.narrative}
              </p>
            </div>
          )}
        </section>

        {/* Right 35%: Live Dynamic Leaderboard */}
        <section className="gm-leaderboard-board">
          <div className="gm-lb-header">
            <h2 className="gm-lb-title">BẢNG XẾP HẠNG TRỰC TIẾP</h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#B8860B', fontWeight: 700 }}>
              CẬP NHẬT TỨC THỜI
            </span>
          </div>

          <div className="gm-teams-list">
            {leaderboard.length > 0 ? (
              leaderboard.map((team, idx) => {
                const dec = roundDecisions[team.groupId];
                const isRank1 = team.rank === 1;

                return (
                  <div key={team.groupId} className={`gm-team-row ${isRank1 ? 'rank-1' : ''}`}>
                    <div className="gm-rank-number">#{team.rank}</div>

                    <div className="gm-team-info">
                      <div className="gm-team-title">
                        {team.name || team.groupId}
                        {dec?.isLocked && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: 10,
                              fontFamily: 'var(--font-mono)',
                              padding: '2px 5px',
                              borderRadius: 4,
                              background: '#10B981',
                              color: '#FFFFFF',
                            }}
                          >
                            ĐÃ NỘP
                          </span>
                        )}
                        {dec?.activeCard && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: 9.5,
                              fontFamily: 'var(--font-mono)',
                              padding: '2px 5px',
                              borderRadius: 4,
                              background: '#B8860B',
                              color: '#FFFFFF',
                            }}
                          >
                            THẺ: {dec.activeCard.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="gm-team-axes">
                        <span style={{ color: '#0F3628' }}>TC: {team.axes?.autonomy}</span>
                        <span style={{ color: '#B8860B' }}>KT: {team.axes?.economy}</span>
                        <span style={{ color: '#1E40AF' }}>UT: {team.axes?.prestige}</span>
                      </div>
                    </div>

                    <div className="gm-team-score">{team.score}</div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: 24, fontSize: 13, color: '#76887F' }}>
                Đang chờ các đội kết nối...
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Fixed Bottom Control Bar for GM */}
      <footer className="gm-bottom-toolbar">
        {/* Scenario Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800, color: '#0E281E' }}>
            CHỌN CÂU HỎI (12 CÂU):
          </label>
          <select
            value={selectedScenarioId}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            disabled={session?.status === 'round_open'}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1.5px solid #D8D0BE',
              background: '#FAF7F0',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              fontWeight: 700,
              color: '#0E281E',
              outline: 'none',
              cursor: 'pointer',
              maxWidth: 420,
            }}
          >
            {(scenariosList as any[]).map((sc: any) => (
              <option key={sc.id} value={sc.id}>
                {sc.isBlackSwan ? '⚡ [THIÊN NGA ĐEN] ' : `[Q${sc.order}] `}
                {sc.title}
              </option>
            ))}
          </select>
        </div>

        {/* Master Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {session?.status !== 'round_open' && (
            <button
              type="button"
              className="gm-control-btn primary"
              onClick={handleOpenRound}
            >
              MỞ BIỂU QUYẾT (30S) ▶
            </button>
          )}

          {session?.status === 'round_open' && (
            <button
              type="button"
              className="gm-control-btn warning"
              onClick={handleLockRound}
            >
              KHÓA BIỂU QUYẾT ⏹
            </button>
          )}

          <button
            type="button"
            className="gm-control-btn primary"
            onClick={handleNextRound}
          >
            CÂU HỎI TIẾP THEO ➔
          </button>

          <button
            type="button"
            className="gm-control-btn"
            onClick={handleResetSession}
            title="Đặt lại phiên chơi"
          >
            ĐẶT LẠI ↺
          </button>
        </div>
      </footer>
    </div>
  );
}
