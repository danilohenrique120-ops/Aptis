'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Aptis3DExperienceProps {
  scrollProgress: number;
  activeSection?: string;
}

export function Aptis3DExperience({ scrollProgress }: Aptis3DExperienceProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. SCENE, CAMERA & RENDERER
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.032);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );
    camera.position.set(0, 0, 11);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      // Fallback silencioso caso o navegador bloqueie WebGL
      return;
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 2. LIGHTING (Dynamic ALCHE-style volumetric feel)
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.2);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0x06b6d4, 14, 30);
    coreLight.position.set(0, 0.5, 3.5);
    scene.add(coreLight);

    const accentLightLeft = new THREE.PointLight(0x2563eb, 10, 35);
    accentLightLeft.position.set(-6, 3, 4);
    scene.add(accentLightLeft);

    const accentLightRight = new THREE.PointLight(0x8b5cf6, 9, 35);
    accentLightRight.position.set(6, -3, 4);
    scene.add(accentLightRight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.5);
    rimLight.position.set(2, 6, 8);
    scene.add(rimLight);

    // 3. MASTER GROUP FOR THE 3D APTIS LOGO & ALCHE GLASS PRISM
    const logoMasterGroup = new THREE.Group();
    scene.add(logoMasterGroup);

    // 3A. Outer Translucent Refractive Delta Prism (ALCHE centerpiece triangle)
    const prismGeometry = new THREE.ConeGeometry(3.35, 4.4, 3, 1);
    prismGeometry.rotateY(Math.PI); // Flat face forward / apex up
    const prismMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0a192f,
      emissive: 0x0284c7,
      emissiveIntensity: 0.18,
      metalness: 0.15,
      roughness: 0.12,
      transmission: 0.72,
      thickness: 1.8,
      ior: 1.45,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    });
    const outerPrism = new THREE.Mesh(prismGeometry, prismMaterial);
    outerPrism.position.set(0, -0.1, -0.35);
    logoMasterGroup.add(outerPrism);

    // Glowing Wireframe Edges on the Outer Prism
    const prismEdgesGeo = new THREE.EdgesGeometry(prismGeometry);
    const prismEdgesMat = new THREE.LineBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.65,
    });
    const prismWireframe = new THREE.LineSegments(prismEdgesGeo, prismEdgesMat);
    outerPrism.add(prismWireframe);

    // 3B. Sculpted 3D Extruded Aptis Logo (4 Geometric Components matching /brand/aptis-symbol.png)
    const aptisSculpture = new THREE.Group();
    aptisSculpture.scale.set(0.85, 0.85, 0.85);
    logoMasterGroup.add(aptisSculpture);

    const extrudeSettingsBase: THREE.ExtrudeGeometryOptions = {
      steps: 1,
      depth: 0.42,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.06,
      bevelOffset: 0,
      bevelSegments: 4,
    };

    const extrudeSettingsCheck: THREE.ExtrudeGeometryOptions = {
      steps: 1,
      depth: 0.62,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.07,
      bevelOffset: 0,
      bevelSegments: 5,
    };

    // Part 1: Upper-Left Navy Delta 'A' Leg
    const navyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0c2448,
      emissive: 0x081c38,
      emissiveIntensity: 0.4,
      metalness: 0.75,
      roughness: 0.22,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
    });

    const leftUpperA = new THREE.Shape();
    leftUpperA.moveTo(0.0, 2.25);
    leftUpperA.lineTo(-1.25, -0.05);
    leftUpperA.lineTo(-0.68, -0.62);
    leftUpperA.lineTo(0.0, 0.68);
    leftUpperA.lineTo(0.38, -0.02);
    leftUpperA.lineTo(0.85, 0.55);
    leftUpperA.closePath();

    const leftUpperMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(leftUpperA, extrudeSettingsBase),
      navyMaterial
    );
    leftUpperMesh.position.z = -0.21;
    aptisSculpture.add(leftUpperMesh);

    // Part 2: Bottom-Left Navy Foot of 'A'
    const leftFootA = new THREE.Shape();
    leftFootA.moveTo(-1.58, -0.68);
    leftFootA.lineTo(-2.35, -2.1);
    leftFootA.lineTo(-1.48, -2.1);
    leftFootA.lineTo(-1.05, -1.25);
    leftFootA.closePath();

    const leftFootMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(leftFootA, extrudeSettingsBase),
      navyMaterial
    );
    leftFootMesh.position.z = -0.21;
    aptisSculpture.add(leftFootMesh);

    // Part 3: Lower-Right Navy Leg & Crossbar of 'A'
    const rightLegA = new THREE.Shape();
    rightLegA.moveTo(1.12, -0.15);
    rightLegA.lineTo(2.22, -2.1);
    rightLegA.lineTo(1.32, -2.1);
    rightLegA.lineTo(0.95, -1.4);
    rightLegA.lineTo(-0.22, -1.4);
    rightLegA.lineTo(0.32, -0.78);
    rightLegA.lineTo(0.65, -0.78);
    rightLegA.closePath();

    const rightLegMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(rightLegA, extrudeSettingsBase),
      navyMaterial
    );
    rightLegMesh.position.z = -0.21;
    aptisSculpture.add(rightLegMesh);

    // Part 4: The Iconic Glowing Cyan Checkmark (✓)
    const cyanCheckMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x00f2fe,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.15,
      metalness: 0.25,
      roughness: 0.1,
      clearcoat: 1.0,
    });

    const checkShape = new THREE.Shape();
    checkShape.moveTo(-1.22, -0.35);
    checkShape.lineTo(-1.58, -0.92);
    checkShape.lineTo(-0.52, -2.18);
    checkShape.lineTo(1.62, 1.05);
    checkShape.lineTo(1.45, 1.18);
    checkShape.lineTo(-0.52, -1.18);
    checkShape.closePath();

    const checkMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(checkShape, extrudeSettingsCheck),
      cyanCheckMaterial
    );
    checkMesh.position.z = -0.28;
    aptisSculpture.add(checkMesh);

    // Part 5: Brushed Titanium/Silver Chevron Arrow (↗) at Top-Right
    const silverChevronMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      emissive: 0x64748b,
      emissiveIntensity: 0.25,
      metalness: 0.88,
      roughness: 0.18,
      clearcoat: 0.9,
    });

    const chevronShape = new THREE.Shape();
    chevronShape.moveTo(0.32, 2.25);
    chevronShape.lineTo(1.68, 2.25);
    chevronShape.lineTo(2.38, 1.02);
    chevronShape.lineTo(1.62, -0.18);
    chevronShape.lineTo(1.18, 0.42);
    chevronShape.lineTo(1.58, 1.02);
    chevronShape.lineTo(1.22, 1.65);
    chevronShape.lineTo(0.62, 1.65);
    chevronShape.closePath();

    const chevronMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(chevronShape, extrudeSettingsBase),
      silverChevronMaterial
    );
    chevronMesh.position.z = -0.18;
    aptisSculpture.add(chevronMesh);

    // 4. OPENING LUMINOUS PORTAL VORTEX RING (00:00 in the ALCHE Reel)
    const portalGroup = new THREE.Group();
    scene.add(portalGroup);

    const portalTorusGeo = new THREE.TorusGeometry(4.4, 0.055, 24, 140);
    const portalTorusMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
    });
    const portalRingMain = new THREE.Mesh(portalTorusGeo, portalTorusMat);
    portalGroup.add(portalRingMain);

    // Chromatic Aberration Offset Rings (Cyan + Violet + White)
    const portalRingCyan = new THREE.Mesh(
      new THREE.TorusGeometry(4.48, 0.025, 16, 120),
      new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.45 })
    );
    portalRingCyan.rotation.x = 0.08;
    portalGroup.add(portalRingCyan);

    const portalRingViolet = new THREE.Mesh(
      new THREE.TorusGeometry(4.32, 0.03, 16, 120),
      new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.45 })
    );
    portalRingViolet.rotation.y = -0.08;
    portalGroup.add(portalRingViolet);

    // 5. 3D PERSPECTIVE CYBER-GRID TUNNEL (ALCHE curved spatial grid background)
    const tunnelGroup = new THREE.Group();
    scene.add(tunnelGroup);

    const gridColor = new THREE.Color(0x0ea5e9);
    // Create floor, ceiling, left wall, right wall perspective grids
    const createWallGrid = (width: number, depth: number, segW: number, segD: number) => {
      const geo = new THREE.PlaneGeometry(width, depth, segW, segD);
      const mat = new THREE.MeshBasicMaterial({
        color: gridColor,
        wireframe: true,
        transparent: true,
        opacity: 0.11,
      });
      return new THREE.Mesh(geo, mat);
    };

    const floorGrid = createWallGrid(28, 90, 24, 60);
    floorGrid.rotation.x = -Math.PI / 2;
    floorGrid.position.set(0, -6.5, -25);
    tunnelGroup.add(floorGrid);

    const ceilingGrid = createWallGrid(28, 90, 24, 60);
    ceilingGrid.rotation.x = Math.PI / 2;
    ceilingGrid.position.set(0, 6.5, -25);
    tunnelGroup.add(ceilingGrid);

    const leftWallGrid = createWallGrid(90, 13, 60, 12);
    leftWallGrid.rotation.y = Math.PI / 2;
    leftWallGrid.position.set(-14, 0, -25);
    tunnelGroup.add(leftWallGrid);

    const rightWallGrid = createWallGrid(90, 13, 60, 12);
    rightWallGrid.rotation.y = -Math.PI / 2;
    rightWallGrid.position.set(14, 0, -25);
    tunnelGroup.add(rightWallGrid);

    // 6. FLOATING 3D HOLOGRAPHIC STREAM FRAMES IN TUNNEL (ALCHE flying cards effect)
    const holoFramesGroup = new THREE.Group();
    scene.add(holoFramesGroup);

    const frameMeshes: THREE.Mesh[] = [];
    const frameCount = 10;
    for (let i = 0; i < frameCount; i++) {
      const isLeft = i % 2 === 0;
      const frameGeo = new THREE.PlaneGeometry(3.6, 2.1, 4, 2);
      const frameMat = new THREE.MeshBasicMaterial({
        color: isLeft ? 0x06b6d4 : 0x3b82f6,
        wireframe: true,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(frameGeo, frameMat);
      mesh.position.set(
        isLeft ? -7.2 - (i % 3) * 0.8 : 7.2 + (i % 3) * 0.8,
        ((i % 4) - 1.5) * 1.4,
        -i * 7.5
      );
      mesh.rotation.y = isLeft ? 0.42 : -0.42;
      holoFramesGroup.add(mesh);
      frameMeshes.push(mesh);
    }

    // 7. VOLUMETRIC FLOATING PARTICLES
    const particlesCount = 420;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 70 - 10;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.065,
      transparent: true,
      opacity: 0.55,
    });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // 8. MOUSE PARALLAX TRACKING
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 9. RESIZE HANDLER
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 10. ANIMATION LOOP (Scroll + Time + Mouse Choreography)
    let animationFrameId: number;
    let smoothedScroll = 0;

    const colorCyan = new THREE.Color(0x06b6d4);
    const colorEmerald = new THREE.Color(0x10b981);
    const colorAmber = new THREE.Color(0xf59e0b);
    const colorCrimson = new THREE.Color(0xef4444);
    const colorIndigo = new THREE.Color(0x6366f1);

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const t = now * 0.001;
      const targetScroll = scrollRef.current;
      smoothedScroll += (targetScroll - smoothedScroll) * 0.07;

      currentMouseX += (targetMouseX - currentMouseX) * 0.06;
      currentMouseY += (targetMouseY - currentMouseY) * 0.06;

      // A. Scroll-driven color shift of the 3D Prism (like ALCHE 00:01 -> 00:06 -> 00:08 -> 00:12)
      const activeColor = new THREE.Color();
      if (smoothedScroll < 0.22) {
        activeColor.lerpColors(colorCyan, colorEmerald, smoothedScroll / 0.22);
      } else if (smoothedScroll < 0.52) {
        activeColor.lerpColors(colorEmerald, colorAmber, (smoothedScroll - 0.22) / 0.3);
      } else if (smoothedScroll < 0.75) {
        activeColor.lerpColors(colorAmber, colorCrimson, (smoothedScroll - 0.52) / 0.23);
      } else {
        activeColor.lerpColors(colorCrimson, colorIndigo, (smoothedScroll - 0.75) / 0.25);
      }

      coreLight.color.copy(activeColor);
      prismMaterial.emissive.copy(activeColor);
      prismEdgesMat.color.copy(activeColor);
      portalTorusMat.color.copy(activeColor);
      (floorGrid.material as THREE.MeshBasicMaterial).color.copy(activeColor);
      (ceilingGrid.material as THREE.MeshBasicMaterial).color.copy(activeColor);

      // B. 3D Aptis Logo & Prism rotation + floating choreography
      logoMasterGroup.rotation.y =
        Math.sin(t * 0.55) * 0.28 +
        smoothedScroll * Math.PI * 2.2 +
        currentMouseX * 0.45;
      logoMasterGroup.rotation.x =
        Math.cos(t * 0.4) * 0.1 +
        Math.sin(smoothedScroll * Math.PI * 2) * 0.15 -
        currentMouseY * 0.28;
      logoMasterGroup.rotation.z = Math.sin(t * 0.3) * 0.05;

      // Upper Stage in Hero (y = 1.85) -> smoothly glides to center and recedes in Z as user scrolls
      const heroTransition = Math.min(smoothedScroll * 3.5, 1);
      const stageY = 1.85 * (1 - heroTransition) + Math.sin(t * 1.2) * 0.14;
      const stageZ = -heroTransition * 3.2;
      const heroScale = 0.88 - heroTransition * 0.25;

      logoMasterGroup.position.set(0, stageY, stageZ);
      logoMasterGroup.scale.setScalar(heroScale);

      // Counter-rotate outer prism slightly for layered refractive effect
      outerPrism.rotation.y = -t * 0.25 + smoothedScroll * Math.PI;

      // C. Opening Portal Ring choreography (centered on the 3D Logo in the upper stage, expands on scroll)
      const portalScale = 0.72 + smoothedScroll * 2.6;
      portalGroup.position.set(0, stageY, stageZ - 0.3);
      portalGroup.scale.setScalar(portalScale);
      portalRingMain.rotation.z = t * 0.35;
      portalRingCyan.rotation.z = -t * 0.5;
      portalRingViolet.rotation.z = t * 0.65;
      portalGroup.rotation.x = currentMouseY * 0.2;
      portalGroup.rotation.y = currentMouseX * 0.2;
      portalTorusMat.opacity = Math.max(0.1, 0.75 - smoothedScroll * 1.1);

      // D. Tunnel & Flying Holographic Frames movement along Z
      const tunnelOffset = (smoothedScroll * 45) % 7.5;
      tunnelGroup.position.z = tunnelOffset;

      frameMeshes.forEach((mesh, idx) => {
        const baseZ = -idx * 7.5 + smoothedScroll * 52;
        // Loop frames smoothly in tunnel
        const wrappedZ = ((baseZ + 40) % 75) - 60;
        mesh.position.z = wrappedZ;
        mesh.rotation.z = Math.sin(t + idx) * 0.04;
      });

      // E. Particle stream forward motion
      particleSystem.rotation.z = t * 0.03;
      particleSystem.position.z = (smoothedScroll * 35) % 20;

      // F. Subtle Camera Parallax
      camera.position.x = currentMouseX * 0.65;
      camera.position.y = currentMouseY * 0.45;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Three.js WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Subtle Scanline & Vignette Overlay (ALCHE Cyber-Studio Post-Processing) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#020617_95%)] opacity-80" />
    </div>
  );
}
