import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export interface BrandLogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  enableHoverTilt?: boolean;
}

/**
 * 2D Fallback / Vector Stamp for Brand Logo
 */
const FallbackLogoSvg: React.FC<{ size: number; className?: string; style?: React.CSSProperties }> = ({
  size,
  className = '',
  style = {},
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 240 240"
    role="img"
    aria-label="The Bamboo Diplomat mark"
    className={className}
    style={{ display: 'inline-block', flexShrink: 0, ...style }}
  >
    <defs>
      <linearGradient id="blm_bambooBlade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#68A98F" />
        <stop offset="1" stopColor="#1C5C47" />
      </linearGradient>
      <linearGradient id="blm_goldRing" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F0DFB6" />
        <stop offset=".5" stopColor="#B88A33" />
        <stop offset="1" stopColor="#5C4416" />
      </linearGradient>
      <radialGradient id="blm_ink" cx=".5" cy=".5" r=".7">
        <stop offset="0" stopColor="#0F3628" />
        <stop offset="1" stopColor="#050807" />
      </radialGradient>
    </defs>

    {/* Ceremonial disc */}
    <circle cx="120" cy="120" r="112" fill="url(#blm_ink)" />
    <circle cx="120" cy="120" r="110" fill="none" stroke="url(#blm_goldRing)" strokeWidth="1.6" opacity=".95" />
    <circle cx="120" cy="120" r="94" fill="none" stroke="#B88A33" strokeWidth=".8" opacity=".4" />

    {/* Three axes tick marks (Autonomy / Economy / Prestige) */}
    <g stroke="#D8B46D" strokeWidth="1.2" opacity=".7">
      <line x1="120" y1="12" x2="120" y2="26" />
      <line x1="218" y1="168" x2="206" y2="161" />
      <line x1="22" y1="168" x2="34" y2="161" />
    </g>

    {/* Bamboo culm — three internodes, rising */}
    <g transform="translate(120 200)">
      <rect x="-9" y="-160" width="18" height="160" rx="6" fill="url(#blm_bambooBlade)" />
      <g fill="#0F3628" stroke="#D8B46D" strokeWidth=".9">
        <rect x="-11" y="-52" width="22" height="4.5" rx="1.8" />
        <rect x="-11" y="-100" width="22" height="4.5" rx="1.8" />
        <rect x="-11" y="-148" width="22" height="4.5" rx="1.8" />
      </g>
      <path d="M-8 -128 C -60 -140 -78 -108 -30 -96 C -50 -110 -30 -122 -8 -122 Z" fill="#2F7D62" />
      <path d="M8 -76 C 60 -90 80 -58 32 -46 C 52 -60 32 -70 8 -70 Z" fill="#68A98F" />
      <path
        d="M-14 0 C -22 -6 -30 -4 -34 4 M14 0 C 22 -6 30 -4 34 4 M0 0 C 0 -8 -6 -12 -8 -14 M0 0 C 0 -8 6 -12 8 -14"
        stroke="#8E6A24"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </g>

    {/* Cardinal points */}
    <g fill="#D8B46D" opacity=".9">
      <circle cx="120" cy="12" r="2.5" />
      <circle cx="228" cy="120" r="2.5" />
      <circle cx="120" cy="228" r="2.5" />
      <circle cx="12" cy="120" r="2.5" />
    </g>
  </svg>
);

/**
 * Three.js + GSAP Animated 3D Bamboo Diplomat Logo Mark
 * Features:
 * - 3D Sacred Lacquer disc with polished gold filigree rim
 * - Three rising Vietnamese bamboo culms (representing Autonomy, Economy, Prestige)
 * - Metallic gold internode nodes & fluttering jade leaves
 * - Continuous GSAP ambient glow & organic wind breeze swaying
 * - Interactive cursor hover 3D tilt
 * - Automatic graceful fallback if WebGL is unavailable
 */
export const BrandLogoMark: React.FC<BrandLogoProps> = ({
  size = 48,
  className = '',
  style = {},
  enableHoverTilt = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    // Check if WebGL is supported
    if (typeof window === 'undefined') return;
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Setup Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 8.8);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(size, size, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    } catch {
      setHasWebGL(false);
      return;
    }

    // Master Root Group & Resource Disposables tracker
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    const disposables: { dispose: () => void }[] = [];

    // ==========================================
    // 1. Lacquer Ceremonial Backing Disc & Gold Rim
    // ==========================================
    const discGeo = new THREE.CylinderGeometry(3.3, 3.3, 0.12, 48);
    discGeo.rotateX(Math.PI / 2);
    const lacquerMat = new THREE.MeshStandardMaterial({
      color: 0x071510,
      roughness: 0.18,
      metalness: 0.35,
    });
    const discMesh = new THREE.Mesh(discGeo, lacquerMat);
    discMesh.position.z = -0.3;
    rootGroup.add(discMesh);
    disposables.push(discGeo, lacquerMat);

    // Outer Gold Rim
    const rimGeo = new THREE.TorusGeometry(3.36, 0.07, 16, 64);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.22,
      metalness: 0.88,
    });
    const rimMesh = new THREE.Mesh(rimGeo, goldMat);
    rimMesh.position.z = -0.22;
    rootGroup.add(rimMesh);
    disposables.push(rimGeo, goldMat);

    // Inner Delicate Filigree Ring
    const innerRimGeo = new THREE.TorusGeometry(2.7, 0.03, 12, 48);
    const innerRimMesh = new THREE.Mesh(innerRimGeo, goldMat);
    innerRimMesh.position.z = -0.2;
    rootGroup.add(innerRimMesh);
    disposables.push(innerRimGeo);

    // ==========================================
    // 2. Bamboo Stalks (Three Axes)
    // ==========================================
    const stalkGroup = new THREE.Group();
    rootGroup.add(stalkGroup);

    const emeraldMat = new THREE.MeshStandardMaterial({
      color: 0x1f664e,
      roughness: 0.3,
      metalness: 0.25,
    });
    disposables.push(emeraldMat);

    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x5fa489,
      roughness: 0.38,
      metalness: 0.15,
      side: THREE.DoubleSide,
    });
    disposables.push(leafMat);

    // Helper to build a segmented bamboo stalk
    const createStalk = (
      height: number,
      radius: number,
      segmentCount: number,
      posX: number,
      posZ: number,
      tiltZ: number
    ) => {
      const stalk = new THREE.Group();
      stalk.position.set(posX, -1.8, posZ);
      stalk.rotation.z = tiltZ;

      const segHeight = height / segmentCount;
      for (let i = 0; i < segmentCount; i++) {
        // Internode cylinder (tapers slightly outward at nodes)
        const segGeo = new THREE.CylinderGeometry(radius * 0.94, radius, segHeight * 0.94, 16);
        const segMesh = new THREE.Mesh(segGeo, emeraldMat);
        segMesh.position.y = i * segHeight + segHeight / 2;
        stalk.add(segMesh);
        disposables.push(segGeo);

        // Gold Internode Joint Ring
        if (i < segmentCount) {
          const jointGeo = new THREE.TorusGeometry(radius * 1.08, radius * 0.22, 12, 24);
          jointGeo.rotateX(Math.PI / 2);
          const jointMesh = new THREE.Mesh(jointGeo, goldMat);
          jointMesh.position.y = (i + 1) * segHeight;
          stalk.add(jointMesh);
          disposables.push(jointGeo);

          // Add stylized leaf on joint
          if (i === 1 || i === 2) {
            const leafShape = new THREE.Shape();
            leafShape.moveTo(0, 0);
            leafShape.quadraticCurveTo(0.4, 0.6, 0.8, 1.2);
            leafShape.quadraticCurveTo(0.2, 0.8, 0, 0);
            const leafGeo = new THREE.ShapeGeometry(leafShape);
            const leafMesh = new THREE.Mesh(leafGeo, leafMat);
            const dir = (i % 2 === 0 ? 1 : -1) * (posX >= 0 ? 1 : -1);
            leafMesh.position.set(dir * radius * 0.8, (i + 1) * segHeight, 0.1);
            leafMesh.rotation.z = dir * 0.45;
            leafMesh.rotation.y = dir * 0.3;
            leafMesh.scale.set(0.9, 0.9, 0.9);
            stalk.add(leafMesh);
            disposables.push(leafGeo);
          }
        }
      }
      return stalk;
    };

    // Stalk 1: Center (Tự Chủ / Autonomy - Tallest & Steadfast)
    const centerStalk = createStalk(3.8, 0.22, 3, 0, 0.05, 0);
    // Stalk 2: Left (Kinh Tế / Economy - Resilient)
    const leftStalk = createStalk(3.2, 0.18, 3, -0.68, 0.12, 0.07);
    // Stalk 3: Right (Uy Tín / Prestige - Flexible & Reaching)
    const rightStalk = createStalk(3.4, 0.19, 3, 0.68, 0.1, -0.06);

    stalkGroup.add(centerStalk);
    stalkGroup.add(leftStalk);
    stalkGroup.add(rightStalk);

    // ==========================================
    // 3. Lighting with Ambient Lacquer Glow
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xfff5e0, 1.25);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffe8b0, 2.4);
    keyLight.position.set(3, 5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x2f7d62, 3.2, 12);
    rimLight.position.set(-3.5, -1.5, 3.5);
    scene.add(rimLight);

    const goldGlint = new THREE.PointLight(0xf3ca68, 2.0, 8);
    goldGlint.position.set(0, 2.2, 2.5);
    scene.add(goldGlint);

    // ==========================================
    // 4. GSAP Organic Breathing & Swaying Animations
    // ==========================================
    // Ambient Gold Pulses
    const glintTween = gsap.to(goldGlint, {
      intensity: 3.2,
      duration: 2.2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    // Subtle disc tilt rotation
    const discTween = gsap.to(discMesh.rotation, {
      z: 0.1,
      duration: 4.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    // Gentle Bamboo Wind Flex (Organic Sine Waves)
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Throttling: Skip rendering if browser tab is hidden to save GPU & eliminate lag
      if (document.hidden) return;

      const elapsed = clock.getElapsedTime();

      // Center stalk breathes slightly
      centerStalk.rotation.z = Math.sin(elapsed * 1.2) * 0.035;
      centerStalk.rotation.x = Math.cos(elapsed * 0.9) * 0.02;

      // Left stalk flexes smoothly
      leftStalk.rotation.z = 0.07 + Math.sin(elapsed * 1.5 + 0.8) * 0.045;

      // Right stalk flexes in harmony
      rightStalk.rotation.z = -0.06 + Math.cos(elapsed * 1.4 + 1.2) * 0.045;

      // Soft continuous rim rotation
      rimMesh.rotation.z = elapsed * 0.08;

      if (renderer) {
        renderer.render(scene, camera);
      }
    };
    animate();

    // ==========================================
    // 5. Interactive Mouse Hover 3D Tilt
    // ==========================================
    const container = containerRef.current;
    const handleMouseMove = (e: MouseEvent) => {
      if (!enableHoverTilt || !container) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(rootGroup.rotation, {
        y: x * 0.45,
        x: -y * 0.45,
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      if (!enableHoverTilt) return;
      gsap.to(rootGroup.rotation, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
      });
    };

    if (container && enableHoverTilt) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    // Cleanup resources to guarantee zero memory leaks
    return () => {
      cancelAnimationFrame(animationFrameId);
      glintTween.kill();
      discTween.kill();

      if (container && enableHoverTilt) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }

      // Dispose all tracked Three.js geometries and materials
      for (const item of disposables) {
        item.dispose();
      }

      if (renderer) {
        const gl = renderer.getContext();
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
        renderer.dispose();
      }
    };
  }, [size, enableHoverTilt]);

  if (!hasWebGL) {
    return <FallbackLogoSvg size={size} className={className} style={style} />;
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
        filter: 'drop-shadow(0 4px 12px rgba(212, 175, 55, 0.28))',
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
          cursor: enableHoverTilt ? 'pointer' : 'default',
        }}
      />
    </div>
  );
};

export interface BrandLogoLockupProps {
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  subtitle?: string;
}

export const BrandLogoLockup: React.FC<BrandLogoLockupProps> = ({
  height = 46,
  className = '',
  style = {},
  subtitle = 'KỶ NGUYÊN ĐA CỰC · SITUATION ROOM',
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        userSelect: 'none',
        ...style,
      }}
    >
      <BrandLogoMark size={height} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-display, "Be Vietnam Pro", sans-serif)',
            fontSize: height * 0.42,
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: '#F3EEDC',
            lineHeight: 1.15,
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          THE BAMBOO DIPLOMAT
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: height * 0.22,
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#D8B46D',
            marginTop: 2,
            lineHeight: 1.2,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
};
