"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function CyberWaveGrid() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animId = null;
    let time = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const isMobile = window.innerWidth < 768;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();

    const getWidth = () => container.offsetWidth || window.innerWidth;
    const getHeight = () => container.offsetHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(
      55,
      getWidth() / getHeight(),
      0.1,
      1000
    );
    camera.position.set(0, 12, 45);
    camera.lookAt(0, -1, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(getWidth(), getHeight());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Plane Geometry (Wide format so grid stretches edge-to-edge on all screens)
    const segmentsX = isMobile ? 28 : 56;
    const segmentsZ = isMobile ? 24 : 42;
    const geometry = new THREE.PlaneGeometry(125, 90, segmentsX, segmentsZ);
    geometry.rotateX(-Math.PI / 2);

    // 4. Wireframe Material (Cyber Grid lines)
    const lineMaterial = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0x2563eb, // Royal Cyber Blue
      transparent: true,
      opacity: 0.22,
    });
    const mesh = new THREE.Mesh(geometry, lineMaterial);
    scene.add(mesh);

    // 5. Glowing Intersection Dot Texture (Canvas 2D)
    const dotCanvas = document.createElement("canvas");
    dotCanvas.width = 64;
    dotCanvas.height = 64;
    const ctx = dotCanvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
      grad.addColorStop(0, "rgba(59, 130, 246, 1)"); // Bright blue core
      grad.addColorStop(0.35, "rgba(37, 99, 235, 0.85)"); // Vibrant royal blue
      grad.addColorStop(0.7, "rgba(37, 99, 235, 0.25)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)"); // Fade out
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, Math.PI * 2);
      ctx.fill();
    }
    const dotTexture = new THREE.CanvasTexture(dotCanvas);

    // 6. Points Material (Intersection Glow Nodes)
    const pointsMaterial = new THREE.PointsMaterial({
      size: isMobile ? 0.45 : 0.65,
      map: dotTexture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const points = new THREE.Points(geometry, pointsMaterial);
    scene.add(points);

    // 7. Mouse & Touch Interaction
    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        targetMouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        targetMouseY = (e.touches[0].clientY / window.innerHeight) * 2 - 1;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // 8. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = getWidth();
      const h = getHeight();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    }
    window.addEventListener("resize", handleResize);

    // 9. Animation Loop
    const pos = geometry.attributes.position;
    const vertexCount = pos.count;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Gentle & calm time progression (non-distracting ambient pace)
      time += 0.0032;

      // Smooth cursor lerp interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Elegant, soft sine wave calculation for each vertex
      for (let i = 0; i < vertexCount; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const y =
          Math.sin(x * 0.12 + time * 1.6) * Math.cos(z * 0.1 + time * 1.0) * 1.5 +
          Math.sin((x + z) * 0.05 + time * 1.2) * 0.8;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;

      // Dynamic Camera Orbiting based on cursor
      camera.position.x = 45 * Math.sin(mouseX * 0.15);
      camera.position.z = 45 * Math.cos(mouseX * 0.15) + mouseY * 6;
      camera.position.y = 12 + mouseY * 4;
      camera.lookAt(0, -1, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 10. Clean-up on unmount
    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) resizeObserver.disconnect();

      geometry.dispose();
      lineMaterial.dispose();
      pointsMaterial.dispose();
      dotTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none opacity-60 transition-opacity duration-1000"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
      {/* Smooth bottom transition into page background */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-[#e8f2fe]/50 to-[#e8f2fe] pointer-events-none" />
    </div>
  );
}
