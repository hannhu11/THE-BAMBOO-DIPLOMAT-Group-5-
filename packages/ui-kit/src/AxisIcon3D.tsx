import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export type StrategicAxisType = 'tc' | 'kt' | 'ut' | 'autonomy' | 'economy' | 'prestige';

export interface AxisIcon3DProps {
  axis: StrategicAxisType;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 2D High-fidelity Fallback SVG for Strategic Axes
 */
const AxisIconFallback: React.FC<{ axis: string; size: number }> = ({ axis, size }) => {
  const isTC = axis === 'tc' || axis === 'autonomy';
  const isKT = axis === 'kt' || axis === 'economy';

  if (isTC) {
    // Tự Chủ (Autonomy) - Sacred Green Bamboo Medallion
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Tự Chủ TC Icon">
        <circle cx="50" cy="50" r="46" fill="#0C251C" stroke="#2F7D62" strokeWidth="3" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="4 2" />
        {/* Bamboo Stalk */}
        <rect x="46" y="24" width="8" height="52" rx="3" fill="#68A98F" />
        <rect x="44" y="38" width="12" height="3" rx="1" fill="#D4AF37" />
        <rect x="44" y="56" width="12" height="3" rx="1" fill="#D4AF37" />
        <path d="M46 38 C 30 32 24 44 42 48 Z" fill="#2F7D62" />
        <path d="M54 56 C 70 50 76 62 58 66 Z" fill="#68A98F" />
      </svg>
    );
  }

  if (isKT) {
    // Kinh Tế (Economy) - Imperial Vietnamese Coin (Đồng tiền cổ Thông Bảo)
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Kinh Tế KT Icon">
        <circle cx="50" cy="50" r="46" fill="#241B08" stroke="#D4AF37" strokeWidth="3" />
        <circle cx="50" cy="50" r="38" fill="#5C4314" stroke="#F3CA68" strokeWidth="1.5" />
        {/* Ancient square hole */}
        <rect x="40" y="40" width="20" height="20" rx="2" fill="#241B08" stroke="#F3CA68" strokeWidth="2" />
        {/* Cardinal dots */}
        <circle cx="50" cy="22" r="2.5" fill="#F3CA68" />
        <circle cx="50" cy="78" r="2.5" fill="#F3CA68" />
        <circle cx="22" cy="50" r="2.5" fill="#F3CA68" />
        <circle cx="78" cy="50" r="2.5" fill="#F3CA68" />
      </svg>
    );
  }

  // Uy Tín (Prestige) - Sapphire Dong Son Sun Star
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Uy Tín UT Icon">
      <circle cx="50" cy="50" r="46" fill="#0A1828" stroke="#3B82F6" strokeWidth="3" />
      <circle cx="50" cy="50" r="38" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
      {/* 8-Point Dong Son Solar Star */}
      <polygon points="50,18 55,42 78,35 62,50 78,65 55,58 50,82 45,58 22,65 38,50 22,35 45,42" fill="#D4AF37" />
      <circle cx="50" cy="50" r="7" fill="#1E40AF" stroke="#60A5FA" strokeWidth="1.5" />
    </svg>
  );
};

/**
 * High-Performance Three.js + GSAP 3D Animated Strategic Axis Icon
 * Strict resource management: throttled RAF, context loss on unmount, no memory leaks.
 */
export const AxisIcon3D: React.FC<AxisIcon3DProps> = ({
  axis,
  size = 32,
  className = '',
  style = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  const normAxis = axis.toLowerCase();
  const isTC = normAxis === 'tc' || normAxis === 'autonomy';
  const isKT = normAxis === 'kt' || normAxis === 'economy';
  const isUT = normAxis === 'ut' || normAxis === 'prestige';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check WebGL availability
    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, 0, 4.8);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
      renderer.setSize(size, size, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    } catch {
      setHasWebGL(false);
      return;
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff0d0, 2.0);
    dirLight.position.set(2, 3, 4);
    scene.add(dirLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Geometries and materials to dispose
    const disposables: { dispose: () => void }[] = [];

    // ==========================================
    // 1. TỰ CHỦ (TC) - Green Lacquer & Bamboo Column
    // ==========================================
    if (isTC) {
      // Hexagonal Jade Medallion
      const discGeo = new THREE.CylinderGeometry(1.65, 1.65, 0.12, 6);
      discGeo.rotateX(Math.PI / 2);
      const jadeMat = new THREE.MeshStandardMaterial({
        color: 0x133d2e,
        roughness: 0.25,
        metalness: 0.35,
      });
      const discMesh = new THREE.Mesh(discGeo, jadeMat);
      rootGroup.add(discMesh);
      disposables.push(discGeo, jadeMat);

      // Gold Rim
      const rimGeo = new THREE.TorusGeometry(1.68, 0.06, 12, 6);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.2,
        metalness: 0.85,
      });
      const rimMesh = new THREE.Mesh(rimGeo, goldMat);
      rimMesh.position.z = 0.05;
      rootGroup.add(rimMesh);
      disposables.push(rimGeo, goldMat);

      // Center Bamboo Culm
      const bambooGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.8, 16);
      const bambooMat = new THREE.MeshStandardMaterial({
        color: 0x5fa489,
        roughness: 0.3,
        metalness: 0.2,
      });
      const bambooMesh = new THREE.Mesh(bambooGeo, bambooMat);
      bambooMesh.position.z = 0.14;
      rootGroup.add(bambooMesh);
      disposables.push(bambooGeo, bambooMat);

      // Bamboo Gold Node Rings
      for (let offset of [-0.45, 0.45]) {
        const ringGeo = new THREE.TorusGeometry(0.2, 0.04, 8, 16);
        ringGeo.rotateX(Math.PI / 2);
        const ringMesh = new THREE.Mesh(ringGeo, goldMat);
        ringMesh.position.set(0, offset, 0.14);
        rootGroup.add(ringMesh);
        disposables.push(ringGeo);
      }
    }

    // ==========================================
    // 2. KINH TẾ (KT) - Ancient Imperial Gold Coin (Thông Bảo)
    // ==========================================
    if (isKT) {
      // Coin outer disc
      const coinGeo = new THREE.CylinderGeometry(1.68, 1.68, 0.14, 32);
      coinGeo.rotateX(Math.PI / 2);
      const coinMat = new THREE.MeshStandardMaterial({
        color: 0xc89828,
        roughness: 0.22,
        metalness: 0.9,
      });
      const coinMesh = new THREE.Mesh(coinGeo, coinMat);
      rootGroup.add(coinMesh);
      disposables.push(coinGeo, coinMat);

      // Coin Outer Rim
      const rimGeo = new THREE.TorusGeometry(1.68, 0.07, 12, 32);
      const brightGoldMat = new THREE.MeshStandardMaterial({
        color: 0xf3ca68,
        roughness: 0.15,
        metalness: 0.95,
      });
      const rimMesh = new THREE.Mesh(rimGeo, brightGoldMat);
      rimMesh.position.z = 0.07;
      rootGroup.add(rimMesh);
      disposables.push(rimGeo, brightGoldMat);

      // Square Hole cutout simulation (Dark square center plate)
      const squareGeo = new THREE.BoxGeometry(0.82, 0.82, 0.18);
      const squareMat = new THREE.MeshStandardMaterial({
        color: 0x181206,
        roughness: 0.8,
        metalness: 0.1,
      });
      const squareMesh = new THREE.Mesh(squareGeo, squareMat);
      squareMesh.position.z = 0.08;
      rootGroup.add(squareMesh);
      disposables.push(squareGeo, squareMat);

      // Gold border on square hole
      const squareWireGeo = new THREE.BoxGeometry(0.88, 0.88, 0.06);
      const squareWireMat = new THREE.MeshStandardMaterial({
        color: 0xf3ca68,
        roughness: 0.2,
        metalness: 0.9,
        wireframe: true,
      });
      const squareWire = new THREE.Mesh(squareWireGeo, squareWireMat);
      squareWire.position.z = 0.12;
      rootGroup.add(squareWire);
      disposables.push(squareWireGeo, squareWireMat);
    }

    // ==========================================
    // 3. UY TÍN (UT) - Sapphire Dong Son Sun Star
    // ==========================================
    if (isUT) {
      // Sapphire Deep Blue Disc
      const discGeo = new THREE.CylinderGeometry(1.65, 1.65, 0.12, 32);
      discGeo.rotateX(Math.PI / 2);
      const sapphireMat = new THREE.MeshStandardMaterial({
        color: 0x0f2744,
        roughness: 0.2,
        metalness: 0.45,
      });
      const discMesh = new THREE.Mesh(discGeo, sapphireMat);
      rootGroup.add(discMesh);
      disposables.push(discGeo, sapphireMat);

      // Gold Solar Rim
      const rimGeo = new THREE.TorusGeometry(1.68, 0.06, 12, 32);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.18,
        metalness: 0.88,
      });
      const rimMesh = new THREE.Mesh(rimGeo, goldMat);
      rimMesh.position.z = 0.06;
      rootGroup.add(rimMesh);
      disposables.push(rimGeo, goldMat);

      // 8-Point Dong Son Star Rays (2 intersecting square diamonds)
      const diamondMat = new THREE.MeshStandardMaterial({
        color: 0xf3ca68,
        roughness: 0.2,
        metalness: 0.9,
      });
      disposables.push(diamondMat);

      const d1Geo = new THREE.BoxGeometry(1.15, 1.15, 0.06);
      const d1Mesh = new THREE.Mesh(d1Geo, diamondMat);
      d1Mesh.position.z = 0.1;
      rootGroup.add(d1Mesh);
      disposables.push(d1Geo);

      const d2Geo = new THREE.BoxGeometry(1.15, 1.15, 0.06);
      d2Geo.rotateZ(Math.PI / 4);
      const d2Mesh = new THREE.Mesh(d2Geo, diamondMat);
      d2Mesh.position.z = 0.1;
      rootGroup.add(d2Mesh);
      disposables.push(d2Geo);

      // Central Sapphire Jewel
      const gemGeo = new THREE.SphereGeometry(0.32, 16, 16);
      const gemMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        roughness: 0.1,
        metalness: 0.6,
      });
      const gemMesh = new THREE.Mesh(gemGeo, gemMat);
      gemMesh.position.z = 0.18;
      rootGroup.add(gemMesh);
      disposables.push(gemGeo, gemMat);
    }

    // GSAP Subtle Hover and Idle Tweens
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Throttling: Skip rendering if browser tab is hidden to save GPU & eliminate lag
      if (document.hidden) return;

      const t = clock.getElapsedTime();

      if (isTC) {
        // Tự Chủ: steadfast upright breathing
        rootGroup.rotation.y = Math.sin(t * 0.9) * 0.18;
        rootGroup.rotation.x = Math.cos(t * 0.7) * 0.1;
      } else if (isKT) {
        // Kinh Tế: slow coin glint rotation
        rootGroup.rotation.y = t * 0.6;
        rootGroup.rotation.x = Math.sin(t * 0.8) * 0.15;
      } else if (isUT) {
        // Uy Tín: celestial harmonic solar orbit
        rootGroup.rotation.z = t * 0.4;
        rootGroup.rotation.x = Math.sin(t * 0.7) * 0.2;
        rootGroup.rotation.y = Math.cos(t * 0.7) * 0.2;
      }

      if (renderer) {
        renderer.render(scene, camera);
      }
    };
    animate();

    // Hover interactive tilt
    const container = containerRef.current;
    const handleMouseEnter = () => {
      gsap.to(rootGroup.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.25, ease: 'back.out(2)' });
    };
    const handleMouseLeave = () => {
      gsap.to(rootGroup.scale, { x: 1, y: 1, z: 1, duration: 0.35, ease: 'power2.out' });
    };

    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    // Cleanup to prevent memory leaks and WebGL context limits
    return () => {
      cancelAnimationFrame(animId);

      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }

      for (const item of disposables) {
        item.dispose();
      }

      if (renderer) {
        const gl = renderer.getContext();
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
        renderer.dispose();
      }
    };
  }, [axis, isTC, isKT, isUT, size]);

  if (!hasWebGL) {
    return <AxisIconFallback axis={normAxis} size={size} />;
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        filter: isTC
          ? 'drop-shadow(0 2px 8px rgba(47, 125, 98, 0.4))'
          : isKT
          ? 'drop-shadow(0 2px 8px rgba(212, 175, 55, 0.45))'
          : 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.4))',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          display: 'block',
          cursor: 'pointer',
        }}
      />
    </div>
  );
};
