// src/components/AnimatedMazeBackground.jsx
import React from "react";

export default function AnimatedMazeBackground() {
  return (
    <div style={bgRoot}>
      <div style={bgVignette} />
      <div style={bgGrid} />
      <div style={bgGlowRings} />
    </div>
  );
}

const bgRoot = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  overflow: "hidden",
  pointerEvents: "none"
};

// Soft dark edges to focus the center
const bgVignette = {
  position: "absolute",
  inset: "-12%",
  background:
    "radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.85) 100%)"
};

// Low-contrast “maze-like” grid (cool blue)
const bgGrid = {
  position: "absolute",
  inset: "-20%",
  background: `
    repeating-linear-gradient(0deg,   rgba(0,165,255,0.05) 0 1px, transparent 1px 36px),
    repeating-linear-gradient(90deg,  rgba(0,165,255,0.05) 0 1px, transparent 1px 36px)
  `,
  filter: "blur(0.5px) saturate(110%)",
  animation: "bgDrift 28s linear infinite, bgRotate 180s linear infinite",
  transformOrigin: "50% 50%"
};

// Very subtle center glow ring for depth
const bgGlowRings = {
  position: "absolute",
  left: "50%",
  top: "50%",
  width: "180vmax",
  height: "180vmax",
  transform: "translate(-50%, -50%)",
  background:
    "radial-gradient(circle at center, rgba(0,200,255,0.055) 0 15%, transparent 15% 100%)",
  mixBlendMode: "screen",
  filter: "blur(24px)",
  opacity: 0.55,
  animation: "bgPulse 12s ease-in-out infinite"
};
