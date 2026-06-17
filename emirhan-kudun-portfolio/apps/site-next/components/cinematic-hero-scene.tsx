"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const galleryTextures = [
  "/drawings/renk-11.jpg",
  "/drawings/karakalem-02.jpg",
  "/drawings/renk-05.jpg",
  "/drawings/karakalem-03.jpg",
  "/drawings/renk-01.jpg",
  "/drawings/karakalem-01.jpg",
  "/drawings/renk-04.jpg",
  "/drawings/karakalem-08.jpg"
];

function buildRibbonMaterial(color: string, opacity: number) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.2,
    metalness: 0.62,
    opacity,
    roughness: 0.26,
    side: THREE.DoubleSide,
    transparent: true
  });
}

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  if (Array.isArray(material)) {
    material.forEach((item) => item.dispose());
    return;
  }

  material.dispose();
}

export function CinematicHeroScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasWebGlFallback, setHasWebGlFallback] = useState(false);

  useEffect(() => {
    const targetCanvas = canvasRef.current;
    if (!targetCanvas) return undefined;
    const stableCanvas = targetCanvas as HTMLCanvasElement;

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotionQuery.matches) {
      setHasWebGlFallback(true);
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090908, 0.045);
    const contextAttributes = {
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: false,
      powerPreference: "low-power" as WebGLPowerPreference
    };
    const webGlContext = stableCanvas.getContext("webgl2", contextAttributes)
      || stableCanvas.getContext("webgl", contextAttributes);

    if (!webGlContext) {
      setHasWebGlFallback(true);
      return undefined;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas: stableCanvas,
        context: webGlContext as WebGLRenderingContext,
        preserveDrawingBuffer: false,
        powerPreference: "low-power"
      });
    } catch {
      setHasWebGlFallback(true);
      return undefined;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 760 ? 1.05 : 1.35));

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 90);
    camera.position.set(0.2, 0.48, 9.6);

    const studio = new THREE.Group();
    const gallery = new THREE.Group();
    const constellation = new THREE.Group();
    scene.add(studio, gallery, constellation);

    const coreGeometry = new THREE.IcosahedronGeometry(1.34, 3);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0xd8b775,
      emissive: 0x5a3e16,
      emissiveIntensity: 0.34,
      metalness: 0.74,
      roughness: 0.2
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.scale.set(1.05, 0.72, 1.05);
    studio.add(core);

    const innerGeometry = new THREE.OctahedronGeometry(0.62, 2);
    const innerMaterial = new THREE.MeshStandardMaterial({
      color: 0xefe1bf,
      emissive: 0xb87928,
      emissiveIntensity: 0.18,
      metalness: 0.68,
      roughness: 0.18,
      transparent: true,
      opacity: 0.76
    });
    const innerCore = new THREE.Mesh(innerGeometry, innerMaterial);
    studio.add(innerCore);

    const haloGeometry = new THREE.RingGeometry(1.08, 1.22, 96);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xf0d79f,
      opacity: 0.16,
      side: THREE.DoubleSide,
      transparent: true
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.rotation.set(Math.PI * 0.52, 0.18, 0);
    studio.add(halo);

    const tealHaloMaterial = new THREE.MeshBasicMaterial({
      color: 0x8fd5c8,
      opacity: 0.1,
      side: THREE.DoubleSide,
      transparent: true
    });
    const tealHalo = new THREE.Mesh(haloGeometry, tealHaloMaterial);
    tealHalo.rotation.set(Math.PI * 0.42, -0.24, Math.PI * 0.16);
    tealHalo.scale.setScalar(1.32);
    studio.add(tealHalo);

    const ringGeometry = new THREE.TorusGeometry(2.18, 0.012, 12, 180);
    const rings = [0, 1, 2, 3, 4, 5].map((index) => {
      const ring = new THREE.Mesh(
        ringGeometry,
        buildRibbonMaterial(index % 2 === 0 ? "#d6b16f" : "#f0d79f", 0.66 - index * 0.07)
      );
      ring.rotation.set(index * 0.74, index * 0.58, index * 0.38);
      ring.scale.setScalar(1 + index * 0.22);
      studio.add(ring);
      return ring;
    });

    const textureLoader = new THREE.TextureLoader();
    const cardGeometry = new THREE.PlaneGeometry(1.05, 1.36, 1, 1);
    const loadedTextures: THREE.Texture[] = [];
    const cards = galleryTextures.map((src, index) => {
      const texture = textureLoader.load(src);
      texture.colorSpace = THREE.SRGBColorSpace;
      loadedTextures.push(texture);

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        opacity: 0.74,
        side: THREE.DoubleSide,
        transparent: true
      });
      const card = new THREE.Mesh(cardGeometry, material);
      const angle = index / galleryTextures.length * Math.PI * 2;
      const normalizedIndex = index - (galleryTextures.length - 1) / 2;
      card.position.set(Math.cos(angle) * 4.25, normalizedIndex * 0.24, Math.sin(angle) * 1.55 - 0.35);
      card.rotation.set(0.16 * Math.sin(angle), -angle + Math.PI * 0.5, 0.05 * index);
      card.scale.setScalar(index % 2 === 0 ? 1.08 : 0.92);
      gallery.add(card);
      return card;
    });

    const nodeGeometry = new THREE.SphereGeometry(0.035, 12, 12);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xf0d79f, transparent: true, opacity: 0.78 });
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf0d79f, transparent: true, opacity: 0.2 });
    const nodes: THREE.Mesh[] = [];
    const linePositions: number[] = [];
    const nodeCount = window.innerWidth < 760 ? 20 : 30;
    for (let index = 0; index < nodeCount; index += 1) {
      const angle = index / nodeCount * Math.PI * 2;
      const radius = 4.6 + (index % 3) * 0.34;
      const y = Math.sin(index * 1.7) * 1.34;
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * 2.2 - 1.8);
      constellation.add(node);
      nodes.push(node);

      if (index > 0) {
        const prev = nodes[index - 1].position;
        linePositions.push(prev.x, prev.y, prev.z, node.position.x, node.position.y, node.position.z);
      }
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const connectorLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    constellation.add(connectorLines);

    const beamGeometry = new THREE.BufferGeometry();
    const beamPositions: number[] = [];
    const beamCount = window.innerWidth < 760 ? 10 : 18;
    for (let index = 0; index < beamCount; index += 1) {
      const angle = index / beamCount * Math.PI * 2;
      const radius = 2.8 + (index % 4) * 0.42;
      beamPositions.push(
        Math.cos(angle) * radius,
        -1.7 + Math.sin(index * 0.7) * 0.38,
        Math.sin(angle) * 1.8 - 1.8,
        Math.cos(angle + 0.34) * (radius + 2.4),
        1.5 + Math.cos(index * 0.6) * 0.5,
        Math.sin(angle + 0.34) * 2.4 - 2.6
      );
    }
    beamGeometry.setAttribute("position", new THREE.Float32BufferAttribute(beamPositions, 3));
    const beamMaterial = new THREE.LineBasicMaterial({
      color: 0xd6b16f,
      opacity: 0.13,
      transparent: true
    });
    const cinematicBeams = new THREE.LineSegments(beamGeometry, beamMaterial);
    scene.add(cinematicBeams);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = window.innerWidth < 760 ? 280 : 520;
    const positions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const radius = 3.4 + Math.random() * 6.6;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 4.8;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = height;
      positions[index * 3 + 2] = Math.sin(angle) * radius - 2.2;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0xe5c27b,
        opacity: 0.34,
        size: 0.023,
        transparent: true
      })
    );
    scene.add(particles);

    const tealParticleGeometry = new THREE.BufferGeometry();
    const tealParticleCount = window.innerWidth < 760 ? 90 : 180;
    const tealPositions = new Float32Array(tealParticleCount * 3);
    for (let index = 0; index < tealParticleCount; index += 1) {
      const radius = 2.2 + Math.random() * 5.8;
      const angle = Math.random() * Math.PI * 2;
      tealPositions[index * 3] = Math.cos(angle) * radius;
      tealPositions[index * 3 + 1] = (Math.random() - 0.5) * 3.6;
      tealPositions[index * 3 + 2] = Math.sin(angle) * radius - 1.4;
    }
    tealParticleGeometry.setAttribute("position", new THREE.BufferAttribute(tealPositions, 3));
    const tealParticles = new THREE.Points(
      tealParticleGeometry,
      new THREE.PointsMaterial({
        color: 0x8fd5c8,
        opacity: 0.18,
        size: 0.018,
        transparent: true
      })
    );
    scene.add(tealParticles);

    const keyLight = new THREE.PointLight(0xf3ce8a, 6.4, 18);
    keyLight.position.set(3.2, 2.6, 3.8);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x76d7c4, 3.1, 18);
    rimLight.position.set(-3.8, -0.9, 3.4);
    scene.add(rimLight);

    const lowSweep = new THREE.PointLight(0xd6b16f, 2.4, 16);
    lowSweep.position.set(-1.6, -2.4, 4.2);
    scene.add(lowSweep);

    const ambient = new THREE.AmbientLight(0xc7ad78, 0.42);
    scene.add(ambient);

    let animationFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let scrollProgress = 0;
    let isVisible = true;

    function resizeRendererToDisplaySize() {
      const width = stableCanvas.clientWidth;
      const height = stableCanvas.clientHeight;
      const ratio = renderer.getPixelRatio();
      const needsResize = stableCanvas.width !== Math.floor(width * ratio)
        || stableCanvas.height !== Math.floor(height * ratio);

      if (needsResize) {
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(height, 1);
        camera.updateProjectionMatrix();
      }
    }

    function updateScrollProgress() {
      const bounds = stableCanvas.getBoundingClientRect();
      const viewport = Math.max(window.innerHeight, 1);
      scrollProgress = Math.min(1, Math.max(0, (viewport - bounds.top) / (viewport + Math.max(bounds.height, 1))));
    }

    function onPointerMove(event: PointerEvent) {
      const bounds = stableCanvas.getBoundingClientRect();
      pointerX = ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 2;
      pointerY = ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 2;
    }

    function render(time: number) {
      const reduceMotion = reduceMotionQuery.matches;
      const seconds = time * 0.001;
      resizeRendererToDisplaySize();

      const motionScale = reduceMotion ? 0.08 : 1;
      const depthShift = reduceMotion ? 0 : scrollProgress;

      camera.position.x = 0.2 + pointerX * 0.18;
      camera.position.y = 0.48 - pointerY * 0.12 + depthShift * 0.34;
      camera.position.z = 9.6 - depthShift * 1.28;
      camera.lookAt(0, 0.04, 0);

      studio.rotation.y = seconds * 0.28 * motionScale + pointerX * 0.13 + depthShift * 0.36;
      studio.rotation.x = Math.sin(seconds * 0.34) * 0.12 * motionScale - pointerY * 0.05;
      gallery.rotation.y = -seconds * 0.15 * motionScale - depthShift * 0.54;
      gallery.position.y = Math.sin(seconds * 0.28) * 0.16 * motionScale;
      constellation.rotation.y = seconds * 0.11 * motionScale + depthShift * 0.58;
      particles.rotation.y = seconds * 0.052 * motionScale;
      tealParticles.rotation.y = -seconds * 0.037 * motionScale;
      cinematicBeams.rotation.y = -seconds * 0.045 * motionScale + depthShift * 0.22;
      cinematicBeams.rotation.z = Math.sin(seconds * 0.24) * 0.035 * motionScale;
      lowSweep.position.x = Math.sin(seconds * 0.7) * 3.2;

      core.rotation.y = seconds * 0.42 * motionScale;
      innerCore.rotation.x = -seconds * 0.54 * motionScale;
      innerCore.rotation.z = seconds * 0.38 * motionScale;
      halo.rotation.z = seconds * 0.18 * motionScale;
      tealHalo.rotation.z = -seconds * 0.14 * motionScale;
      halo.scale.setScalar(1 + Math.sin(seconds * 1.1) * 0.04 * motionScale + depthShift * 0.1);
      tealHalo.scale.setScalar(1.32 + Math.cos(seconds * 0.9) * 0.05 * motionScale);

      rings.forEach((ring, index) => {
        ring.rotation.z += (0.0027 + index * 0.0009) * motionScale;
        ring.rotation.x += (0.0015 + index * 0.0006) * motionScale;
      });

      cards.forEach((card, index) => {
        card.position.y += Math.sin(seconds * 0.58 + index) * 0.0014 * motionScale;
        card.rotation.z += Math.sin(seconds * 0.28 + index) * 0.00035 * motionScale;
      });

      renderer.render(scene, camera);
      if (isVisible) {
        animationFrame = window.requestAnimationFrame(render);
      } else {
        animationFrame = 0;
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = Boolean(entry?.isIntersecting);
      if (isVisible && animationFrame === 0) {
        animationFrame = window.requestAnimationFrame(render);
      }
    }, { threshold: 0.02 });

    stableCanvas.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);
    observer.observe(stableCanvas);
    updateScrollProgress();
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      stableCanvas.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
      observer.disconnect();
      coreGeometry.dispose();
      coreMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      haloGeometry.dispose();
      haloMaterial.dispose();
      tealHaloMaterial.dispose();
      ringGeometry.dispose();
      rings.forEach((ring) => disposeMaterial(ring.material));
      cardGeometry.dispose();
      cards.forEach((card) => disposeMaterial(card.material));
      loadedTextures.forEach((texture) => texture.dispose());
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      beamGeometry.dispose();
      beamMaterial.dispose();
      particleGeometry.dispose();
      disposeMaterial(particles.material);
      tealParticleGeometry.dispose();
      disposeMaterial(tealParticles.material);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="cinematic-scene" aria-hidden="true">
      {hasWebGlFallback ? (
        <div className="cinematic-fallback-scene">
          <span className="fallback-orbit fallback-orbit-one" />
          <span className="fallback-orbit fallback-orbit-two" />
          <span className="fallback-core" />
          {galleryTextures.map((src, index) => (
            <span className="fallback-frame" style={{ backgroundImage: `url(${src})` }} key={src}>
              <span>{index + 1}</span>
            </span>
          ))}
        </div>
      ) : (
        <canvas ref={canvasRef} />
      )}
      <div className="cinematic-vignette" />
    </div>
  );
}
