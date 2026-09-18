import React, { useEffect, useRef } from 'react';

export interface SovereigntyRadarProps {
  className?: string;
  width?: number;
  height?: number;
  isCrisis?: boolean;
  crisisLevel?: 'normal' | 'elevated' | 'critical';
}

interface RadarPoint {
  x: number;
  y: number;
  label: string;
  sub: string;
  color: string;
  pulseSize: number;
}

export const SovereigntyRadar: React.FC<SovereigntyRadarProps> = ({
  className = '',
  width = 380,
  height = 380,
  isCrisis = false,
  crisisLevel = 'normal',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let angle = 0;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY) - 24;

    // Sovereign landmarks in scaled radar space
    const points: RadarPoint[] = [
      { x: centerX + maxRadius * 0.45, y: centerY - maxRadius * 0.35, label: 'HOÀNG SA', sub: 'HẢI PHẬN VN', color: '#F3CA68', pulseSize: 0 },
      { x: centerX + maxRadius * 0.55, y: centerY + maxRadius * 0.45, label: 'TRƯỜNG SA', sub: 'HẢI PHẬN VN', color: '#F3CA68', pulseSize: 0 },
      { x: centerX - maxRadius * 0.25, y: centerY - maxRadius * 0.20, label: 'ĐÀ NẴNG (APG)', sub: 'TRẠM CẬP BỜ', color: '#10B981', pulseSize: 0 },
      { x: centerX - maxRadius * 0.40, y: centerY + maxRadius * 0.35, label: 'VŨNG TÀU (AAG)', sub: 'TRUYỀN DẪN QUỐC TẾ', color: '#10B981', pulseSize: 0 },
    ];

    const isCrisis = crisisLevel === 'critical';
    const mainStroke = isCrisis ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.35)';
    const sweepColor = isCrisis ? 'rgba(239, 68, 68, 0.18)' : 'rgba(16, 185, 129, 0.16)';

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Dark radar background with radial vignette
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, maxRadius);
      bgGrad.addColorStop(0, isCrisis ? '#180B0D' : '#071813');
      bgGrad.addColorStop(1, '#050D0A');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Concentric distance rings (50nm, 100nm, 200nm EEZ)
      ctx.lineWidth = 1;
      const rings = [0.25, 0.5, 0.75, 1.0];
      rings.forEach((scale, i) => {
        ctx.strokeStyle = i === rings.length - 1 ? (isCrisis ? '#EF4444' : '#D8B46D') : mainStroke;
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * scale, 0, Math.PI * 2);
        ctx.stroke();

        // Distance text label
        ctx.fillStyle = 'rgba(168, 179, 175, 0.6)';
        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.fillText(`${(i + 1) * 50} NM`, centerX + 4, centerY - maxRadius * scale + 10);
      });

      // 3. Crosshairs & 30-deg radial spokes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(a) * maxRadius, centerY + Math.sin(a) * maxRadius);
        ctx.stroke();
      }

      // 4. Submarine cable routes (curved dashed lines)
      if (points.length >= 4 && points[0] && points[2] && points[3]) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // Route Vũng Tàu -> Hong Kong / Quốc Tế
        ctx.moveTo(points[3].x, points[3].y);
        ctx.quadraticCurveTo(centerX + maxRadius * 0.2, centerY + maxRadius * 0.1, points[0].x + 30, points[0].y - 40);
        ctx.stroke();
        // Route Đà Nẵng -> Quốc tế
        ctx.beginPath();
        ctx.moveTo(points[2].x, points[2].y);
        ctx.quadraticCurveTo(centerX + maxRadius * 0.1, centerY - maxRadius * 0.4, centerX + maxRadius * 0.8, centerY - maxRadius * 0.6);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash
      }

      // 5. 360-degree Rotating Sweep Beam
      const sweepGradient = ctx.createConicGradient(angle, centerX, centerY);
      sweepGradient.addColorStop(0, sweepColor);
      sweepGradient.addColorStop(0.12, 'transparent');
      sweepGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
      ctx.fill();

      // Bright sweep leading edge line
      const lineX = centerX + Math.cos(angle) * maxRadius;
      const lineY = centerY + Math.sin(angle) * maxRadius;
      ctx.strokeStyle = isCrisis ? '#EF4444' : '#10B981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(lineX, lineY);
      ctx.stroke();

      // 6. Sovereign Points & Ping Blips
      points.forEach((pt) => {
        pt.pulseSize = (pt.pulseSize + 0.03) % 1.5;
        const currentPulse = pt.pulseSize;

        // Expanding ping wave
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4 + currentPulse * 12, 0, Math.PI * 2);
        ctx.stroke();

        // Core solid dot
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Label tag
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px "Be Vietnam Pro", sans-serif';
        ctx.fillText(pt.label, pt.x + 8, pt.y - 2);

        ctx.fillStyle = 'rgba(216, 180, 109, 0.85)';
        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillText(pt.sub, pt.x + 8, pt.y + 8);
      });

      // 7. Outer dial markings
      ctx.strokeStyle = isCrisis ? '#EF4444' : '#D8B46D';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Compass headings
      ctx.fillStyle = isCrisis ? '#EF4444' : '#D8B46D';
      ctx.font = 'bold 10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('N · 000°', centerX, centerY - maxRadius - 6);
      ctx.fillText('E · 090°', centerX + maxRadius + 16, centerY + 3);
      ctx.fillText('S · 180°', centerX, centerY + maxRadius + 14);
      ctx.fillText('W · 270°', centerX - maxRadius - 16, centerY + 3);
      ctx.textAlign = 'left';

      angle += 0.025;
      if (angle >= Math.PI * 2) angle = 0;

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [width, height, crisisLevel]);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <div className="absolute top-2 left-4 z-10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
        <span className="text-[10px] font-['IBM_Plex_Mono',monospace] tracking-widest text-[#D8B46D] uppercase">
          RADAR CHỦ QUYỀN BIỂN ĐÔNG · HẢI PHẬN EEZ
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-full shadow-[0_0_40px_rgba(16,185,129,0.12)] border border-[#2F7D62]/40"
      />
    </div>
  );
};
