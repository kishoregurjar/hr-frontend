"use client";

import { useRef } from "react";

export default function TiltGlowCard({
  children,
  className = "",
  maxTilt = 12,
  ...props
}) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    const normX = x / w - 0.5; // [-0.5, 0.5]
    const normY = y / h - 0.5; // [-0.5, 0.5]

    const rotateY = normX * maxTilt;
    const rotateX = -normY * maxTilt;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    card.style.transform = `perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    card.style.setProperty("--mouse-x", "30%");
    card.style.setProperty("--mouse-y", "30%");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
      }}
      className={`group relative rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-sm transition-all duration-300 ease-out hover:border-blue-500/60 hover:shadow-[0_24px_48px_-12px_rgba(37,99,235,0.22)] cursor-pointer select-none overflow-hidden ${className}`}
      {...props}
    >
      {/* TechTantra Replica: Dual-Layer Vibrant Blue Gradient (Top-Left 22% Wash + 25% Cursor Torch) */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"
        style={{
          background:
            "radial-gradient(circle 260px at var(--mouse-x, 30%) var(--mouse-y, 30%), rgba(37, 99, 235, 0.25) 0%, transparent 75%), linear-gradient(135deg, rgba(37, 99, 235, 0.22) 0%, rgba(96, 165, 250, 0.09) 45%, #ffffff 82%)",
        }}
      />

      {/* Content Container (Layered above the gradient) */}
      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        {children}
      </div>
    </div>
  );
}
