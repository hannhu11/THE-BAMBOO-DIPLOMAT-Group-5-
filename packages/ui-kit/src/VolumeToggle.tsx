import React, { useState, useEffect } from 'react';
import { audioEngine } from './AudioEngine';

export interface VolumeToggleProps {
  className?: string;
  onToggle?: (isMuted: boolean) => void;
  style?: React.CSSProperties;
}

export const VolumeToggle: React.FC<VolumeToggleProps> = ({ className = '', onToggle, style }) => {
  const [muted, setMuted] = useState<boolean>(() => audioEngine.getIsMuted());

  useEffect(() => {
    setMuted(audioEngine.getIsMuted());
  }, []);

  const handleClick = () => {
    const newState = audioEngine.toggleMute();
    setMuted(newState);
    if (!newState) {
      audioEngine.playClick();
    }
    onToggle?.(newState);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={muted ? 'Bật âm thanh hiệu ứng' : 'Tắt âm thanh'}
      aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 12px',
        borderRadius: 999,
        border: muted ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(243, 202, 104, 0.45)',
        background: muted
          ? 'linear-gradient(180deg, rgba(16, 26, 21, 0.92), rgba(8, 14, 11, 0.96))'
          : 'linear-gradient(180deg, rgba(28, 48, 38, 0.95), rgba(14, 26, 20, 0.98))',
        color: muted ? '#8E9C95' : '#F3CA68',
        boxShadow: muted ? 'none' : '0 0 14px rgba(243, 202, 104, 0.25)',
        cursor: 'pointer',
        userSelect: 'none',
        outline: 'none',
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: 1.2,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      {muted ? (
        <svg
          style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', flexShrink: 0 }}
          viewBox="0 0 24 24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <svg
            style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none' }}
            viewBox="0 0 24 24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
          <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2, height: 10 }}>
            <span style={{ width: 2, height: 6, background: '#D8B46D', borderRadius: 2 }} />
            <span style={{ width: 2, height: 10, background: '#10B981', borderRadius: 2 }} />
            <span style={{ width: 2, height: 5, background: '#D8B46D', borderRadius: 2 }} />
          </span>
        </div>
      )}
      <span>{muted ? 'MUTE' : 'AUDIO'}</span>
    </button>
  );
};
