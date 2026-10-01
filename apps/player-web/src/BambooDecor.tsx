import React from 'react';
import './gacha-portal.css';

/** Một thân tre: thân + đốt + vài cặp lá. Toạ độ cố định để render ổn định. */
interface Stalk {
  x: number;
  width: number;
  color: string;
  dark: string;
  nodes: number[];
  leaves: { node: number; dir: 1 | -1; len: number; rot: number }[];
}

const STALKS: Stalk[] = [
  {
    x: 34,
    width: 16,
    color: '#2F7D62',
    dark: '#1C5C47',
    nodes: [70, 190, 320, 440, 575, 690, 820, 940],
    leaves: [
      { node: 190, dir: 1, len: 78, rot: -18 },
      { node: 320, dir: 1, len: 64, rot: 8 },
      { node: 575, dir: 1, len: 82, rot: -12 },
      { node: 820, dir: 1, len: 70, rot: 14 },
    ],
  },
  {
    x: 104,
    width: 11,
    color: '#68A98F',
    dark: '#2F7D62',
    nodes: [30, 130, 250, 380, 500, 640, 760, 890],
    leaves: [
      { node: 130, dir: 1, len: 60, rot: -6 },
      { node: 380, dir: -1, len: 56, rot: 10 },
      { node: 640, dir: 1, len: 66, rot: -16 },
      { node: 890, dir: -1, len: 58, rot: 6 },
    ],
  },
  {
    x: 158,
    width: 8,
    color: '#B5D6C6',
    dark: '#68A98F',
    nodes: [110, 240, 360, 500, 620, 750, 880],
    leaves: [
      { node: 240, dir: 1, len: 46, rot: -10 },
      { node: 620, dir: 1, len: 50, rot: 4 },
    ],
  },
];

const leafPath = (len: number) =>
  `M0 0 C ${len * 0.25} ${-len * 0.12} ${len * 0.7} ${-len * 0.1} ${len} ${len * 0.04} ` +
  `C ${len * 0.68} ${len * 0.14} ${len * 0.28} ${len * 0.12} 0 0 Z`;

/** Khóm tre trang trí hai mép màn hình. Chỉ mang tính thẩm mỹ. */
export const BambooGrove: React.FC<{ side: 'left' | 'right' }> = ({ side }) => (
  <div className={`bamboo-grove bamboo-grove-${side}`} aria-hidden="true">
    <svg viewBox="0 0 220 1000" preserveAspectRatio="xMidYMax slice" width="100%" height="100%">
      <defs>
        {STALKS.map((s, i) => (
          <linearGradient key={i} id={`stalk-${side}-${i}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={s.dark} />
            <stop offset="0.45" stopColor={s.color} />
            <stop offset="1" stopColor={s.dark} />
          </linearGradient>
        ))}
      </defs>
      {STALKS.map((s, i) => (
        <g key={i}>
          <rect x={s.x - s.width / 2} y={-10} width={s.width} height={1020} fill={`url(#stalk-${side}-${i})`} />
          {s.nodes.map((y) => (
            <g key={y}>
              <rect
                x={s.x - s.width / 2 - 2.5}
                y={y - 3}
                width={s.width + 5}
                height={6}
                rx={3}
                fill={s.dark}
              />
              <rect
                x={s.x - s.width / 2 - 1}
                y={y - 1}
                width={s.width + 2}
                height={1.5}
                fill="rgba(255,255,255,0.25)"
              />
            </g>
          ))}
          {s.leaves.map((l, j) => (
            <g
              key={j}
              className="bamboo-leaf"
              style={{ animationDelay: `${(i * 4 + j) * 0.7}s` }}
              transform={`translate(${s.x} ${l.node}) scale(${l.dir} 1) rotate(${l.rot})`}
            >
              <path d={leafPath(l.len)} fill={s.color} opacity="0.85" />
              <path d={leafPath(l.len * 0.72)} fill={s.dark} opacity="0.7" transform="rotate(-24)" />
            </g>
          ))}
        </g>
      ))}
    </svg>
  </div>
);

/** Đường kẻ ngang hình đốt tre, dùng ngăn các khối nội dung. */
export const BambooDivider: React.FC<{ label?: string }> = ({ label }) => (
  <div className="bamboo-divider" role="separator" aria-label={label}>
    <span className="bamboo-divider-line" />
    <svg width="64" height="20" viewBox="0 0 64 20" aria-hidden="true">
      <rect x="0" y="6" width="64" height="8" rx="4" fill="#2F7D62" />
      <rect x="0" y="6" width="64" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
      <rect x="24" y="3" width="6" height="14" rx="3" fill="#1C5C47" />
      <rect x="40" y="3" width="6" height="14" rx="3" fill="#1C5C47" />
      <path d="M32 6 C 38 -2 50 -2 56 2 C 48 6 40 8 32 6 Z" fill="#68A98F" />
    </svg>
    <span className="bamboo-divider-line" />
  </div>
);
