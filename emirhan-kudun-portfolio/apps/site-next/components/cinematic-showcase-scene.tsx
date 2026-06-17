"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const showcaseImages = [
  "/drawings/karakalem-01.jpg",
  "/drawings/renk-11.jpg",
  "/drawings/renk-04.jpg",
  "/drawings/karakalem-03.jpg",
  "/drawings/renk-05.jpg",
  "/drawings/karakalem-08.jpg",
  "/drawings/renk-01.jpg",
  "/drawings/renk-10.jpg"
];

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  if (Array.isArray(material)) {
    material.forEach((item) => item.dispose());
    return;
  }

  material.dispose();
}

export function CinematicShowcaseScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasWebGlFallback, setHasWebGlFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const stableCanvas = canvas as HTMLCanvasElement;

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotionQuery.matches) {
      setHasWebGlFallback(true);
      return undefined;
    }

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 760 ? 1.05 : 1.28));

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x10100e, 6, 18);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
    camera.position.set(0, 0.65, 8.2);

    const root = new THREE.Group();
    scene.add(root);

    const textureLoader = new THREE.TextureLoader();
    const textures: THREE.Texture[] = [];
    const planeGeometry = new THREE.PlaneGeometry(1.18, 1.5);
    const panels = showcaseImages.map((src, index) => {
      const texture = textureLoader.load(src);
      texture.colorSpace = THREE.SRGBColorSpace;
      textures.push(texture);

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        opacity: 0.84,
        side: THREE.DoubleSide,
        transparent: true
      });
      const mesh = new THREE.Mesh(planeGeometry, material);
      const angle = index / showcaseImages.length * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * 3.2, Math.sin(index * 1.25) * 0.68, Math.sin(angle) * 1.95);
      mesh.rotation.set(0.08, -angle + Math.PI * 0.5, (index - 1.5) * 0.05);
      mesh.scale.setScalar(index % 2 === 0 ? 1.08 : 0.9);
      root.add(mesh);
      return mesh;
    });

    const ringGeometry = new THREE.TorusGeometry(2.85, 0.01, 8, 160);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xd6b16f,
      opacity: 0.42,
      transparent: true
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI * 0.52;
    root.add(ring);

    const secondRingMaterial = new THREE.MeshBasicMaterial({
      color: 0x8fd5c8,
      opacity: 0.22,
      transparent: true
    });
    const secondRing = new THREE.Mesh(ringGeometry, secondRingMaterial);
    secondRing.rotation.set(Math.PI * 0.38, 0.2, Math.PI * 0.12);
    secondRing.scale.setScalar(1.26);
    root.add(secondRing);

    const thirdRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xf6e8c9,
      opacity: 0.14,
      transparent: true
    });
    const thirdRing = new THREE.Mesh(ringGeometry, thirdRingMaterial);
    thirdRing.rotation.set(Math.PI * 0.62, -0.18, -Math.PI * 0.08);
    thirdRing.scale.setScalar(1.54);
    root.add(thirdRing);

    const gridGeometry = new THREE.BufferGeometry();
    const gridPositions: number[] = [];
    for (let i = -4; i <= 4; i += 1) {
      gridPositions.push(-4, -1.7, i * 0.42, 4, -1.7, i * 0.42);
      gridPositions.push(i * 0.7, -1.7, -2, i * 0.7, -1.7, 2);
    }
    gridGeometry.setAttribute("position", new THREE.Float32BufferAttribute(gridPositions, 3));
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x8fd5c8,
      opacity: 0.16,
      transparent: true
    });
    const grid = new THREE.LineSegments(gridGeometry, gridMaterial);
    root.add(grid);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = window.innerWidth < 760 ? 140 : 280;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.1 + Math.random() * 4.8;
      particlePositions[index * 3] = Math.cos(angle) * radius;
      particlePositions[index * 3 + 1] = (Math.random() - 0.5) * 3.1;
      particlePositions[index * 3 + 2] = Math.sin(angle) * radius - 0.7;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xf0d79f,
      opacity: 0.26,
      size: 0.02,
      transparent: true
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    root.add(particles);

    const rayGeometry = new THREE.BufferGeometry();
    const rayPositions: number[] = [];
    for (let index = 0; index < 14; index += 1) {
      const angle = index / 14 * Math.PI * 2;
      rayPositions.push(
        Math.cos(angle) * 1.2,
        -1.48 + Math.sin(index) * 0.16,
        Math.sin(angle) * 0.72 - 0.72,
        Math.cos(angle) * 4.6,
        1.24 + Math.cos(index * 0.65) * 0.32,
        Math.sin(angle) * 2.4 - 1.2
      );
    }
    rayGeometry.setAttribute("position", new THREE.Float32BufferAttribute(rayPositions, 3));
    const rayMaterial = new THREE.LineBasicMaterial({
      color: 0xd6b16f,
      opacity: 0.11,
      transparent: true
    });
    const rays = new THREE.LineSegments(rayGeometry, rayMaterial);
    root.add(rays);

    const nodeGeometry = new THREE.SphereGeometry(0.045, 12, 12);
    const glowMaterials = [0xf0d79f, 0xd6b16f, 0x8fd5c8, 0xf6e8c9].map((color) => (
      new THREE.MeshBasicMaterial({ color, opacity: 0.78, transparent: true })
    ));
    const nodes = glowMaterials.map((material, index) => {
      const node = new THREE.Mesh(nodeGeometry, material);
      node.position.set(-1.8 + index * 1.2, 1.55 - Math.sin(index) * 0.26, -0.55);
      root.add(node);
      return node;
    });

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let isVisible = true;

    function resize() {
      const width = stableCanvas.clientWidth;
      const height = stableCanvas.clientHeight;
      const ratio = renderer.getPixelRatio();
      if (stableCanvas.width !== Math.floor(width * ratio) || stableCanvas.height !== Math.floor(height * ratio)) {
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(height, 1);
        camera.updateProjectionMatrix();
      }
    }

    function onPointerMove(event: PointerEvent) {
      const bounds = stableCanvas.getBoundingClientRect();
      pointerX = ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 2;
      pointerY = ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 2;
    }

    function render(time: number) {
      resize();
      const seconds = time * 0.001;
      const motionScale = reduceMotionQuery.matches ? 0.08 : 1;
      root.rotation.y = seconds * 0.24 * motionScale + pointerX * 0.16;
      root.rotation.x = pointerY * -0.055 + Math.sin(seconds * 0.22) * 0.025 * motionScale;
      ring.rotation.z = seconds * 0.2 * motionScale;
      secondRing.rotation.z = -seconds * 0.15 * motionScale;
      thirdRing.rotation.z = seconds * 0.11 * motionScale;
      particles.rotation.y = seconds * 0.075 * motionScale;
      rays.rotation.y = -seconds * 0.052 * motionScale;
      rays.position.y = Math.sin(seconds * 0.44) * 0.08 * motionScale;
      grid.position.z = Math.sin(seconds * 0.36) * 0.26 * motionScale;

      panels.forEach((panel, index) => {
        panel.position.y += Math.sin(seconds * 0.66 + index) * 0.0013 * motionScale;
        panel.rotation.z += Math.sin(seconds * 0.32 + index) * 0.00045 * motionScale;
      });

      nodes.forEach((node, index) => {
        const pulse = 1 + Math.sin(seconds * 2.1 + index) * 0.24 * motionScale;
        node.scale.setScalar(pulse);
      });

      camera.position.x = pointerX * 0.22;
      camera.position.y = 0.65 - pointerY * 0.12;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);

      if (isVisible) {
        frame = window.requestAnimationFrame(render);
      } else {
        frame = 0;
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = Boolean(entry?.isIntersecting);
      if (isVisible && frame === 0) {
        frame = window.requestAnimationFrame(render);
      }
    }, { threshold: 0.04 });

    stableCanvas.addEventListener("pointermove", onPointerMove, { passive: true });
    observer.observe(stableCanvas);
    frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      stableCanvas.removeEventListener("pointermove", onPointerMove);
      observer.disconnect();
      planeGeometry.dispose();
      panels.forEach((panel) => disposeMaterial(panel.material));
      textures.forEach((texture) => texture.dispose());
      ringGeometry.dispose();
      ringMaterial.dispose();
      secondRingMaterial.dispose();
      thirdRingMaterial.dispose();
      gridGeometry.dispose();
      gridMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      rayGeometry.dispose();
      rayMaterial.dispose();
      nodeGeometry.dispose();
      glowMaterials.forEach((material) => material.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div className="showcase-scene" aria-hidden="true">
      {hasWebGlFallback ? (
        <div className="showcase-fallback-scene" role="presentation">
          <span className="showcase-fallback-ring" />
          {showcaseImages.map((src, index) => (
            <span className="showcase-fallback-panel" style={{ backgroundImage: `url(${src})` }} key={src}>
              {index + 1}
            </span>
          ))}
        </div>
      ) : (
        <canvas ref={canvasRef} role="presentation" />
      )}
    </div>
  );
}
