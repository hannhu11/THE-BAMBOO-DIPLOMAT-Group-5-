import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { audioEngine, BrandLogoMark, TacticalCard } from '@bamboo/ui-kit';
import {
  CARD_ACTIVATION_TIMING,
  CARD_CATALOG,
  CARD_CATEGORY_META,
  CARD_USES_PER_GAME,
  CardCategory,
  CardCatalogEntry,
  CardType,
  getCardsByCategory,
} from '@bamboo/domain-types';
import { BambooDivider, BambooGrove } from './BambooDecor';

const STEPS: CardCategory[] = ['attack', 'defense', 'utility'];

/** Ba sắc độ cho ba nan quạt của mỗi vòng quay (chữ trắng đều đọc được). */
const SECTOR_COLORS: Record<CardCategory, string[]> = {
  attack: ['#8E6A24', '#B07A1E', '#6E511A'],
  defense: ['#1C5C47', '#2F7D62', '#0F3628'],
  utility: ['#2E5C8A', '#3F73A6', '#1F4468'],
};

const CATEGORY_ACCENT: Record<CardCategory, string> = {
  attack: '#B8860B',
  defense: '#1C5C47',
  utility: '#2E5C8A',
};

const AXIS_SHORT = { autonomy: 'TC', economy: 'KT', prestige: 'UT' } as const;

const CX = 200;
const CY = 200;
const R = 166;
const SPIN_MS = 5200;
const SECTOR = 120;

const pt = (angleDeg: number, r: number) => {
  const a = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.sin(a), y: CY - r * Math.cos(a) };
};

const sectorPath = (index: number) => {
  const start = pt(index * SECTOR - SECTOR / 2, R);
  const end = pt(index * SECTOR + SECTOR / 2, R);
  return `M ${CX} ${CY} L ${start.x} ${start.y} A ${R} ${R} 0 0 1 ${end.x} ${end.y} Z`;
};

/** Tách tên thẻ thành tối đa 2 dòng cân đối. */
const splitName = (name: string): string[] => {
  const words = name.split(' ');
  if (words.length <= 2) return [name];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ').length;
    const b = words.slice(i).join(' ').length;
    if (Math.abs(a - b) < bestDiff) {
      bestDiff = Math.abs(a - b);
      best = i;
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const LEAF_COLORS = ['#2F7D62', '#68A98F', '#B5D6C6', '#D8B46D', '#9CCDB4'];

interface CardRevealProps {
  entry: CardCatalogEntry;
  categoryLabel: string;
  accent: string;
  isLast: boolean;
  /** Phần tử vòng quay: lá bài bay ra từ đây */
  getFrom: () => HTMLElement | null;
  /** Ô nhóm thẻ trên thanh bước: lá bài bay về đây khi nhận */
  getTo: () => HTMLElement | null;
  onClosed: () => void;
}

/** Lá bài bay từ vòng quay lên giữa màn hình, xoay một vòng rồi hiện đầy đủ thông tin */
const CardReveal: React.FC<CardRevealProps> = ({ entry, categoryLabel, accent, isLast, getFrom, getTo, onClosed }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const reduced = prefersReducedMotion();
  // Thu nhỏ lá bài nếu màn hình thấp để luôn thấy trọn vẹn cả lá bài lẫn nút
  const fit = Math.min(1, (window.innerHeight - 170) / 480, (window.innerWidth - 32) / 300);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const fly = flyRef.current;
    const glow = glowRef.current;
    const burst = burstRef.current;
    const caption = captionRef.current;
    const float = floatRef.current;
    if (!overlay || !fly || !glow || !burst || !caption || !float) return;

    const ctx = gsap.context(() => {
      const rect = fly.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const fromEl = getFrom()?.getBoundingClientRect();
      const dx = fromEl ? fromEl.left + fromEl.width / 2 - cx : 0;
      const dy = fromEl ? fromEl.top + fromEl.height / 2 - cy : 0;

      gsap.set(fly, { transformPerspective: 1200 });

      if (reduced) {
        gsap.fromTo([overlay, fly, caption], { opacity: 0 }, { opacity: 1, duration: 0.3 });
        return;
      }

      const tl = gsap.timeline();
      tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' }, 0)
        .fromTo(
          fly,
          { x: dx, y: dy, scale: 0.12, rotationY: -720, rotationZ: -28, opacity: 0 },
          { x: 0, y: 0, scale: 1, rotationY: 0, rotationZ: 0, opacity: 1, duration: 1.35, ease: 'power3.out' },
          0.05
        )
        .fromTo(glow, { scale: 0.3, opacity: 0 }, { scale: 1.15, opacity: 1, duration: 1, ease: 'power2.out' }, 0.25)
        .fromTo(caption, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' }, 1.0);

      // Lá tre và đốm sáng toả ra khi lá bài về tới giữa màn hình
      const parts = 22;
      for (let i = 0; i < parts; i++) {
        const el = document.createElement('span');
        el.className = i % 4 === 0 ? 'gp-spark' : 'gp-leaf-particle';
        el.style.background = i % 4 === 0 ? '#F3CA68' : LEAF_COLORS[i % LEAF_COLORS.length]!;
        burst.appendChild(el);
        const angle = (i / parts) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 150 + Math.random() * 190;
        tl.fromTo(
          el,
          { x: 0, y: 0, scale: 0.2, opacity: 1, rotation: Math.random() * 360 },
          {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist * 0.85,
            scale: 0.8 + Math.random() * 0.8,
            opacity: 0,
            rotation: `+=${(Math.random() - 0.5) * 540}`,
            duration: 1.2 + Math.random() * 0.5,
            ease: 'power2.out',
          },
          0.95
        );
      }

      // Lơ lửng nhẹ nhàng sau khi lá bài đã về chỗ
      gsap.to(float, { y: -9, duration: 1.7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.4 });
      try {
        audioEngine.playCardFlip();
      } catch {
        /* âm thanh không bắt buộc */
      }
    }, overlay);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    if (closing) return;
    setClosing(true);
    const overlay = overlayRef.current;
    const fly = flyRef.current;
    const float = floatRef.current;
    if (!overlay || !fly || reduced) {
      onClosed();
      return;
    }
    try {
      audioEngine.playCardActivate();
    } catch {
      /* âm thanh không bắt buộc */
    }
    gsap.killTweensOf(float);
    const cur = fly.getBoundingClientRect();
    const to = getTo()?.getBoundingClientRect();
    const ddx = to ? to.left + to.width / 2 - (cur.left + cur.width / 2) : 0;
    const ddy = to ? to.top + to.height / 2 - (cur.top + cur.height / 2) : -200;
    const tl = gsap.timeline({ onComplete: onClosed });
    tl.to(float, { y: 0, duration: 0.15 }, 0)
      .to(captionRef.current, { opacity: 0, y: 12, duration: 0.2 }, 0)
      .to(
        fly,
        {
          x: `+=${ddx}`,
          y: `+=${ddy}`,
          scale: 0.1,
          rotationY: 360,
          rotationZ: 12,
          opacity: 0.2,
          duration: 0.75,
          ease: 'power3.in',
        },
        0
      )
      .to(overlay, { opacity: 0, duration: 0.45, ease: 'power1.in' }, 0.35);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  return (
    <div ref={overlayRef} className="gp-reveal" role="dialog" aria-modal="true" aria-label={`Bạn nhận được thẻ ${entry.name}`}>
      <div className="gp-reveal-stage">
        <div ref={glowRef} className="gp-reveal-glow" aria-hidden="true" style={{ ['--accent' as string]: accent }} />
        <div ref={burstRef} className="gp-reveal-burst" aria-hidden="true" />
        <div ref={flyRef} className="gp-reveal-fly" style={{ height: 480 * fit, width: 300 * fit }}>
          <div ref={floatRef} style={{ width: 300 * fit, height: 480 * fit }}>
            <div style={{ width: 300, height: 480, transform: `scale(${fit})`, transformOrigin: '0 0' }}>
              <TacticalCard type={entry.id} status="ready" />
            </div>
          </div>
        </div>
      </div>

      <div ref={captionRef} className="gp-reveal-caption">
        <span className="gp-reveal-tag" style={{ background: accent }}>
          {categoryLabel}
        </span>
        <div className="gp-reveal-name">Bạn nhận được “{entry.name}”</div>
        <button type="button" className="gp-btn gp-btn-primary" onClick={close} disabled={closing}>
          {isLast ? 'NHẬN THẺ CUỐI ✓' : 'NHẬN THẺ ✓'}
        </button>
        <div className="gp-reveal-hint">Chạm vào lá bài để lật xem điển tích</div>
      </div>
    </div>
  );
};

interface GachaPortalProps {
  /** [tấn công, phòng thủ, chức năng] — kết quả do server quyết định */
  cards: CardType[];
  teamName: string;
  onComplete: () => void;
  /** Khoá localStorage để nhớ tiến độ quay khi refresh trang */
  storageKey?: string;
}

export const GachaPortal: React.FC<GachaPortalProps> = ({ cards, teamName, onComplete, storageKey }) => {
  // Khôi phục tiến độ nếu người chơi refresh trang giữa chừng (chỉ dùng khi đúng bộ thẻ đã lưu)
  const saved = useMemo(() => {
    if (!storageKey) return null;
    try {
      const s = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (
        s &&
        s.cards === cards.join(',') &&
        Array.isArray(s.drawn) &&
        s.drawn.length === STEPS.length &&
        Number.isInteger(s.step) &&
        s.step >= 0 &&
        s.step < STEPS.length
      ) {
        return s as { step: number; drawn: boolean[] };
      }
    } catch {
      /* dữ liệu lưu hỏng thì bỏ qua */
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /** Góc để con trỏ chỉ đúng thẻ đã bốc ở bước s */
  const alignedAngle = (s: number) => {
    const k = getCardsByCategory(STEPS[s]!).findIndex((c) => c.id === cards[s]);
    return k > 0 ? 360 - k * SECTOR : 0;
  };

  const [step, setStep] = useState(saved ? saved.step : 0);
  /** Góc nghỉ của vòng quay khi không chạy hoạt ảnh (0 hoặc căn sẵn sau khi bỏ qua / khôi phục) */
  const [restAngle, setRestAngle] = useState(saved && saved.drawn[saved.step] ? alignedAngle(saved.step) : 0);
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'landed'>(
    saved && saved.drawn[saved.step] ? 'landed' : 'idle'
  );
  const [drawn, setDrawn] = useState<boolean[]>(saved ? saved.drawn : [false, false, false]);
  /** Chỉ số bước đang hiển thị màn lá bài bay ra (null = đóng) */
  const [reveal, setReveal] = useState<number | null>(null);
  const rotorRef = useRef<SVGGElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);
  const wheelWrapRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const angleRef = useRef(0);

  const category = STEPS[step]!;
  const meta = CARD_CATEGORY_META[category];
  const sectorCards = useMemo(() => getCardsByCategory(category), [category]);
  const resultId = cards[step];
  const result: CardCatalogEntry | undefined = CARD_CATALOG.find((c) => c.id === resultId);
  const allDrawn = drawn.every(Boolean);
  const reduced = prefersReducedMotion();

  // Đặt góc nghỉ cho vòng quay mỗi khi sang bước mới (vòng quay được tạo lại theo key={step})
  useLayoutEffect(() => {
    if (rotorRef.current) {
      gsap.set(rotorRef.current, { rotation: restAngle, svgOrigin: `${CX} ${CY}` });
    }
    angleRef.current = restAngle;
  }, [step, restAngle]);

  useEffect(
    () => () => {
      if (rotorRef.current) gsap.killTweensOf(rotorRef.current);
    },
    []
  );

  // Ghi nhớ tiến độ để refresh trang không phải quay lại từ đầu
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ cards: cards.join(','), step, drawn }));
    } catch {
      /* localStorage có thể bị chặn */
    }
  }, [storageKey, cards, step, drawn]);

  const markDrawn = (index: number) =>
    setDrawn((prev) => {
      const copy = [...prev];
      copy[index] = true;
      return copy;
    });

  const handleSpin = () => {
    if (phase !== 'idle' || !result) return;
    const k = sectorCards.findIndex((c) => c.id === result.id);
    if (k < 0) return;

    // Kết quả đã được server chọn; vòng quay chỉ dừng đúng vào nan quạt đó.
    const jitter = (Math.random() * 2 - 1) * 36;
    const target = (((360 - (k * SECTOR + jitter)) % 360) + 360) % 360;
    const turns = reduced ? 1 : 6;
    const rotor = rotorRef.current;
    if (!rotor) return;
    const next = Math.ceil(angleRef.current / 360) * 360 + 360 * turns + target;

    setPhase('spinning');

    // Tiếng "tách" + con trỏ rung mỗi khi một đốt tre (10°) đi qua con trỏ
    let lastTick = Math.floor(angleRef.current / 10);
    let lastSound = 0;
    gsap.to(rotor, {
      rotation: next,
      svgOrigin: `${CX} ${CY}`,
      duration: reduced ? 0.9 : SPIN_MS / 1000,
      ease: 'power4.out',
      onUpdate: () => {
        const r = Number(gsap.getProperty(rotor, 'rotation'));
        angleRef.current = r;
        const tick = Math.floor(r / 10);
        if (tick === lastTick) return;
        lastTick = tick;
        const now = performance.now();
        if (now - lastSound < 55) return; // tránh dồn âm thanh lúc quay nhanh
        lastSound = now;
        if (pointerRef.current) {
          gsap.fromTo(pointerRef.current, { rotation: -14 }, { rotation: 0, duration: 0.14, ease: 'power2.out', overwrite: true });
        }
        try {
          audioEngine.playClick();
        } catch {
          /* âm thanh không bắt buộc */
        }
      },
      onComplete: () => {
        angleRef.current = next;
        setPhase('landed');
        markDrawn(step);
        setReveal(step); // lá bài bay ra
        try {
          audioEngine.playFanfare();
        } catch {
          /* âm thanh không bắt buộc */
        }
      },
    });
  };

  // Lá bài đã bay về ô nhóm thẻ: cho ô đó "nảy" lên một chút
  const handleRevealClosed = () => {
    const closedStep = reveal;
    setReveal(null);
    if (closedStep === null || prefersReducedMotion()) return;
    const slot = stepRefs.current[closedStep];
    if (slot) {
      gsap.fromTo(slot, { scale: 1.12 }, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
    }
  };

  const handleNext = () => {
    if (phase !== 'landed' || step >= STEPS.length - 1) return;
    setStep(step + 1);
    setRestAngle(0);
    setPhase('idle');
  };

  const handleSkip = () => {
    if (rotorRef.current) gsap.killTweensOf(rotorRef.current);
    setReveal(null);
    const last = STEPS.length - 1;
    const lastIndex = getCardsByCategory(STEPS[last]!).findIndex((c) => c.id === cards[last]);
    setDrawn([true, true, true]);
    setStep(last);
    // Căn sẵn vòng quay cuối cùng để con trỏ chỉ đúng thẻ đã bốc
    const aligned = lastIndex > 0 ? 360 - lastIndex * SECTOR : 0;
    setRestAngle(aligned);
    setPhase('landed');
    // Nếu đang đứng sẵn ở vòng cuối thì layout effect không chạy lại, nên căn góc trực tiếp
    if (step === last && rotorRef.current) {
      gsap.set(rotorRef.current, { rotation: aligned, svgOrigin: `${CX} ${CY}` });
      angleRef.current = aligned;
    }
  };

  // App phát tiếng đóng dấu khi vào phòng chơi nên không phát lại ở đây
  const handleFinish = () => {
    // Đã vào phòng chơi: xoá tiến độ để lần đăng nhập sau quay lại từ đầu
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        /* bỏ qua */
      }
    }
    onComplete();
  };

  const colors = SECTOR_COLORS[category];

  return (
    <div className="gp-root">
      <BambooGrove side="left" />
      <BambooGrove side="right" />

      <div className="gp-shell">
        <header className="gp-header">
          <div className="gp-brand">
            <BrandLogoMark size={40} />
            <div>
              <div className="gp-eyebrow">NGHI THỨC NGOẠI GIAO ĐẦU TRẬN</div>
              <h1 className="gp-title">Vòng Quay Thẻ Chiến Lược</h1>
            </div>
          </div>
          <div className="gp-team">
            <span className="gp-team-label">ĐỘI</span>
            <span className="gp-team-name">{teamName}</span>
          </div>
        </header>

        <div className="gp-grid">
          {/* ===== CỘT TRÁI: VÒNG QUAY ===== */}
          <section className="gp-panel gp-stage" aria-label="Vòng quay bốc thẻ">
            <ol className="gp-steps">
              {STEPS.map((cat, i) => {
                const m = CARD_CATEGORY_META[cat];
                const entry = drawn[i] ? CARD_CATALOG.find((c) => c.id === cards[i]) : undefined;
                const state = drawn[i] ? 'done' : i === step ? 'active' : 'todo';
                return (
                  <li
                    key={cat}
                    ref={(el) => {
                      stepRefs.current[i] = el;
                    }}
                    className={`gp-step gp-step-${state}`}
                    style={{ ['--accent' as string]: CATEGORY_ACCENT[cat] }}
                  >
                    <span className="gp-step-seal">{drawn[i] ? '✓' : m.short}</span>
                    <span className="gp-step-text">
                      <span className="gp-step-cat">{m.label}</span>
                      <span className="gp-step-name">{entry ? entry.name : 'Chưa bốc'}</span>
                    </span>
                  </li>
                );
              })}
            </ol>

            <div className="gp-wheel-wrap" key={step} ref={wheelWrapRef}>
              <div ref={pointerRef} className="gp-pointer" aria-hidden="true">
                <svg width="44" height="56" viewBox="0 0 44 56">
                  <defs>
                    <linearGradient id="gp-pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#F3CA68" />
                      <stop offset="1" stopColor="#B8860B" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M22 54 L4 16 A20 20 0 1 1 40 16 Z"
                    fill="url(#gp-pg)"
                    stroke="#5C4416"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <circle cx="22" cy="18" r="6" fill="#FAF7F0" stroke="#5C4416" strokeWidth="1.5" />
                </svg>
              </div>

              <svg
                className="gp-wheel"
                viewBox="0 0 400 400"
                role="img"
                aria-label={`Vòng quay ${meta.label}: ${sectorCards.map((c) => c.name).join(', ')}`}
              >
                <defs>
                  <radialGradient id="gp-hub" cx="50%" cy="40%" r="70%">
                    <stop offset="0" stopColor="#FDFBF7" />
                    <stop offset="1" stopColor="#E6DFCA" />
                  </radialGradient>
                  <linearGradient id="gp-rim" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#68A98F" />
                    <stop offset="0.5" stopColor="#1C5C47" />
                    <stop offset="1" stopColor="#0F3628" />
                  </linearGradient>
                </defs>

                {/* Vành tre tĩnh */}
                <circle cx={CX} cy={CY} r="196" fill="url(#gp-rim)" stroke="#B8860B" strokeWidth="3" />
                <circle cx={CX} cy={CY} r="176" fill="#0E281E" />

                {/* Phần quay */}
                <g ref={rotorRef} className="gp-rotor">
                  {sectorCards.map((c, i) => {
                    const lines = splitName(c.name);
                    return (
                      <g key={c.id}>
                        <path d={sectorPath(i)} fill={colors[i % colors.length]} stroke="#F0DFB6" strokeWidth="2" />
                        <g transform={`rotate(${i * SECTOR} ${CX} ${CY})`}>
                          <text
                            x={CX}
                            y={CY - 112 - (lines.length - 1) * 8}
                            textAnchor="middle"
                            className="gp-sector-text"
                          >
                            {lines.map((ln, li) => (
                              <tspan key={li} x={CX} dy={li === 0 ? 0 : 18}>
                                {ln}
                              </tspan>
                            ))}
                          </text>
                          <text x={CX} y={CY - 66} textAnchor="middle" className="gp-sector-sub">
                            {c.stats[0]}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                  {/* Đốt tre trên vành */}
                  {Array.from({ length: 36 }).map((_, i) => {
                    const a = pt(i * 10, 186);
                    const b = pt(i * 10, 196);
                    return (
                      <line
                        key={i}
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke={i % 3 === 0 ? '#F0DFB6' : 'rgba(240,223,182,0.45)'}
                        strokeWidth={i % 3 === 0 ? 3 : 1.5}
                        strokeLinecap="round"
                      />
                    );
                  })}
                </g>

                {/* Trục giữa */}
                <circle cx={CX} cy={CY} r="34" fill="url(#gp-hub)" stroke="#B8860B" strokeWidth="3" />
                <g transform="translate(184 184)">
                  <rect x="13" y="0" width="6" height="32" rx="3" fill="#2F7D62" />
                  <rect x="11" y="9" width="10" height="3.5" rx="1.75" fill="#0F3628" />
                  <rect x="11" y="20" width="10" height="3.5" rx="1.75" fill="#0F3628" />
                  <path d="M19 6 C 26 -1 32 0 34 4 C 28 8 23 9 19 6 Z" fill="#68A98F" />
                </g>
              </svg>
            </div>

            <div className="gp-controls">
              {phase === 'idle' && (
                <button type="button" className="gp-btn gp-btn-primary" onClick={handleSpin}>
                  QUAY {meta.label.toUpperCase()}
                </button>
              )}
              {phase === 'spinning' && (
                <button type="button" className="gp-btn gp-btn-primary" disabled>
                  ĐANG QUAY…
                </button>
              )}
              {phase === 'landed' && !allDrawn && (
                <button type="button" className="gp-btn gp-btn-primary" onClick={handleNext}>
                  TIẾP TỤC: QUAY {CARD_CATEGORY_META[STEPS[step + 1]!].label.toUpperCase()} →
                </button>
              )}
              {allDrawn && (
                <button type="button" className="gp-btn gp-btn-primary" onClick={handleFinish}>
                  TIẾP NHẬN MẬT LỆNH & VÀO PHÒNG TÁC CHIẾN →
                </button>
              )}
              {!allDrawn && (
                <button type="button" className="gp-btn gp-btn-ghost" onClick={handleSkip}>
                  Bỏ qua hiệu ứng, hiện cả 3 thẻ
                </button>
              )}
            </div>

            <div className={`gp-result ${phase === 'landed' && result ? 'gp-result-on' : ''}`} aria-live="polite">
              {phase === 'landed' && result ? (
                <div className="gp-result-row">
                  <div style={{ minWidth: 0 }}>
                    <div className="gp-result-head">
                      <span className="gp-result-tag" style={{ background: CATEGORY_ACCENT[category] }}>
                        {meta.label}
                      </span>
                      <strong className="gp-result-name">{result.name}</strong>
                    </div>
                    <div className="gp-chips">
                      {result.stats.map((s) => (
                        <span key={s} className="gp-chip gp-chip-stat">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button type="button" className="gp-btn gp-btn-ghost" onClick={() => setReveal(step)}>
                    Xem lại thẻ
                  </button>
                </div>
              ) : (
                <p className="gp-result-hint">
                  {phase === 'spinning'
                    ? 'Vòng quay đang tìm thẻ dành cho đội bạn…'
                    : `Bấm quay để bốc 1 thẻ thuộc nhóm ${meta.label.toLowerCase()}. Mỗi nhóm có 3 thẻ, kết quả do hệ thống chọn ngẫu nhiên công bằng.`}
                </p>
              )}
            </div>
          </section>

          {/* ===== CỘT PHẢI: DANH SÁCH 9 THẺ ===== */}
          <aside className="gp-panel gp-catalog" aria-label="Danh sách tất cả thẻ chiến lược">
            <div className="gp-catalog-head">
              <h2 className="gp-catalog-title">Bộ 9 Thẻ Chiến Lược</h2>
              <p className="gp-catalog-rules">
                Mỗi đội nhận <b>3 thẻ</b> (1 Công, 1 Thủ, 1 Chức năng). Mỗi thẻ dùng <b>{CARD_USES_PER_GAME} lần</b> / trận,
                mỗi vòng chỉ gắn được <b>1 thẻ</b>. {CARD_ACTIVATION_TIMING}.
              </p>
            </div>

            <div className="gp-catalog-scroll">
              {STEPS.map((cat) => {
                const m = CARD_CATEGORY_META[cat];
                const list = getCardsByCategory(cat);
                const isActive = cat === category && !allDrawn;
                return (
                  <section
                    key={cat}
                    className={`gp-group ${isActive ? 'gp-group-active' : ''}`}
                    style={{ ['--accent' as string]: CATEGORY_ACCENT[cat] }}
                  >
                    <div className="gp-group-head">
                      <span className="gp-group-seal">{m.short}</span>
                      <div>
                        <div className="gp-group-title">
                          {m.label}
                          {isActive && <span className="gp-now">LƯỢT NÀY</span>}
                        </div>
                        <div className="gp-group-sub">
                          Mở khoá khi {m.axisLabel} ≥ 7 · {m.blurb}
                        </div>
                      </div>
                    </div>

                    <ul className="gp-cards">
                      {list.map((c) => {
                        const owned = cards.includes(c.id) && drawn[STEPS.indexOf(cat)];
                        return (
                          <li key={c.id} className={`gp-card ${owned ? 'gp-card-owned' : ''}`}>
                            <div className="gp-card-top">
                              <span className="gp-card-name">{c.name}</span>
                              {owned && <span className="gp-owned">ĐÃ BỐC ✓</span>}
                            </div>
                            <div className="gp-chips">
                              <span className="gp-chip gp-chip-req">
                                Yêu cầu {AXIS_SHORT[c.requirementAxis]} ≥ {c.requirementValue}
                              </span>
                              {c.stats.map((s) => (
                                <span key={s} className="gp-chip gp-chip-stat">
                                  {s}
                                </span>
                              ))}
                            </div>
                            <p className="gp-card-effect">{c.effect}</p>
                            <p className="gp-card-tip">
                              <b>Giá trị: {c.value}.</b> {c.tip}
                            </p>
                            <p className="gp-card-quote">“{c.quote}”</p>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>
          </aside>
        </div>

        <BambooDivider />
      </div>

      {reveal !== null && cards[reveal] && (
        <CardReveal
          key={`${reveal}-${cards[reveal]}`}
          entry={CARD_CATALOG.find((c) => c.id === cards[reveal])!}
          categoryLabel={CARD_CATEGORY_META[STEPS[reveal]!].label}
          accent={CATEGORY_ACCENT[STEPS[reveal]!]}
          isLast={reveal === STEPS.length - 1}
          getFrom={() => wheelWrapRef.current}
          getTo={() => stepRefs.current[reveal] ?? null}
          onClosed={handleRevealClosed}
        />
      )}
    </div>
  );
};
