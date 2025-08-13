// src/App.jsx
import React, { useState, useEffect } from "react";
import { generateMaze } from "./game/maze";
import { canMove, DIRS } from "./game/engine";
import GameCanvas from "./components/GameCanvas";
import HUD from "./components/HUD";
import AnimatedMazeBackground from "./components/AnimatedMazeBackground";

const WIDTH = 15;
const HEIGHT = 15;
const REVEAL_TIME = 800;
const ECHO_PENALTY = 5;

export default function App() {
  // Core state
  const [maze, setMaze] = useState([]);
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [goal, setGoal] = useState({ x: WIDTH - 1, y: HEIGHT - 1 });
  const [revealedTimes, setRevealedTimes] = useState([]);
  const [steps, setSteps] = useState(0);
  const [echoes, setEchoes] = useState(0);
  const [pulses, setPulses] = useState([]);
  const [gameWon, setGameWon] = useState(false);

  // Phases: "title" → "instructions" → "game"
  const [gamePhase, setGamePhase] = useState("title");
  // Fade transition visibility
  const [phaseVisible, setPhaseVisible] = useState(true);

  const score = steps + ECHO_PENALTY * echoes;

  // Create/reset maze
  const startNewMaze = () => {
    setMaze(generateMaze(WIDTH, HEIGHT));
    setPlayer({ x: 0, y: 0 });
    setGoal({ x: WIDTH - 1, y: HEIGHT - 1 });
    setRevealedTimes(Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0)));
    setSteps(0);
    setEchoes(0);
    setPulses([]);
    setGameWon(false);
  };

  useEffect(() => {
    startNewMaze();
  }, []);

  // Echolocation reveal ripple
  const progressiveReveal = (pulse) => {
    const interval = setInterval(() => {
      const now = Date.now();
      const age = now - pulse.start;
      const radius = (age / REVEAL_TIME) * 5;

      setRevealedTimes(prev => {
        const copy = prev.map(row => [...row]);
        for (let y = 0; y < HEIGHT; y++) {
          for (let x = 0; x < WIDTH; x++) {
            if (Math.hypot(x - pulse.x, y - pulse.y) <= radius) {
              copy[y][x] = now;
            }
          }
        }
        return copy;
      });

      if (age > REVEAL_TIME) clearInterval(interval);
    }, 50);
  };

  // Player actions
  const handleAction = (e) => {
    // Movement
    if (DIRS[e.key] !== undefined) {
      const dir = DIRS[e.key];
      if (canMove(player, dir, maze)) {
        const nx = player.x + (dir === 1 ? 1 : dir === 3 ? -1 : 0);
        const ny = player.y + (dir === 2 ? 1 : dir === 0 ? -1 : 0);
        setPlayer({ x: nx, y: ny });
        setSteps(s => s + 1);
        if (nx === goal.x && ny === goal.y) setGameWon(true);
      }
    }
    // Echo pulse
    if (e.key === " " || e.key.toLowerCase() === "e") {
      const pulse = { x: player.x, y: player.y, start: Date.now() };
      setPulses(p => [...p, pulse]);
      setEchoes(eh => eh + 1);
      progressiveReveal(pulse);
    }
  };

  // Phase transition with fade
  const advancePhase = (next) => {
    setPhaseVisible(false);
    setTimeout(() => {
      setGamePhase(next);
      setPhaseVisible(true);
    }, 220);
  };

  // Key handling
  const handleKey = (e) => {
    // Phase changes
    if (gamePhase === "title" && (e.key === "Enter" || e.type === "click")) {
      advancePhase("instructions");
      return;
    }
    if (gamePhase === "instructions" && (e.key === "Enter" || e.type === "click")) {
      advancePhase("game");
      return;
    }

    // Prevent page scroll on game keys
    const blocked = ["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," ","Spacebar","w","a","s","d","e","E"];
    if (blocked.includes(e.key)) e.preventDefault();

    // In-game controls
    if (gamePhase === "game") {
      if (gameWon) {
        if (e.key.toLowerCase() === "r" || e.key === "Enter") startNewMaze();
        return;
      }
      if (e.key.toLowerCase() === "r") { startNewMaze(); return; }
      handleAction(e);
    }
  };

  // Listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKey, { passive: false });
    return () => window.removeEventListener("keydown", handleKey);
  });

  // Cleanup expired pulses
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      setPulses(ps => ps.filter(p => now - p.start < REVEAL_TIME));
    }, 50);
    return () => clearInterval(t);
  }, []);

  // ----------- RENDER PHASES -----------

  // Title
  if (gamePhase === "title") {
    return (
      <div style={rootStyle} onClick={() => advancePhase("instructions")}>
        <AnimatedMazeBackground />
        <div style={{ ...phaseCard, ...(phaseVisible ? fadeIn : fadeOut) }}>
          <h1 style={titleStyle}>🎯 SONIC STEPS</h1>
          <p style={{ color: "#aaa", marginTop: 20 }}>Press Enter or Click to Continue</p>
        </div>
      </div>
    );
  }

  // Instructions
  if (gamePhase === "instructions") {
    return (
      <div style={rootStyle} onClick={() => advancePhase("game")}>
        <AnimatedMazeBackground />
        <div style={{ ...panelStyle, ...(phaseVisible ? fadeInUp : fadeOutDown) }}>
          <h2>How to Play</h2>
          <p>Use sonar-like pulses to find the green goal.</p>
          <ul style={{ textAlign: "left", listStyle: "none", padding: 0 }}>
            <li>🎮 W/A/S/D or Arrows — Move</li>
            <li>✨ Space/E — Echo Pulse to reveal walls</li>
            <li>🔄 R — Restart / New Maze</li>
            <li>📊 Score = Steps + (Echoes × {ECHO_PENALTY})</li>
          </ul>
          <p style={{ fontSize: 14, opacity: 0.8, marginTop: 10 }}>
            Press Enter or Click to Start
          </p>
        </div>
      </div>
    );
  }

  // Game
  return (
    <div style={rootStyle}>
      <AnimatedMazeBackground />
      <div style={{ ...gameBoxStyle, ...(phaseVisible ? fadeInUp : fadeOutDown) }}>
        <h2 style={gameTitle}>🎯 SONIC STEPS</h2>
        <GameCanvas
          maze={maze}
          player={player}
          goal={goal}
          revealedTimes={revealedTimes}
          pulses={pulses}
        />
        <HUD steps={steps} echoes={echoes} gameWon={gameWon} />
        {gameWon && (
          <div style={overlayStyle}>
            <div style={panelStyle}>
              <h2>🎉 Maze Cleared!</h2>
              <p>Score: <b>{score}</b></p>
              <p>Steps: {steps} · Echoes: {echoes} × {ECHO_PENALTY}</p>
              <button style={buttonStyle} onClick={startNewMaze}>New Maze</button>
              <p style={{ fontSize: 12, opacity: 0.7 }}>Press R or Enter to play again</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------- Styles ----------------
const rootStyle = {
  width: "100vw",
  height: "100vh",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#000",
  fontFamily: "'Audiowide', sans-serif",
  textAlign: "center",
  cursor: "pointer"
};

const phaseCard = {
  zIndex: 1,
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(8px)",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.25)",
  padding: "26px 34px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
};

const gameBoxStyle = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(8px)",
  borderRadius: "12px",
  border: "2px solid rgba(255,255,255,0.2)",
  padding: "20px 30px",
  boxShadow: "0 0 30px rgba(0,0,0,0.6)",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative"
};

const titleStyle = {
  fontSize: "3em",
  color: "#00c8ff",
  letterSpacing: "3px",
  textShadow:
    "0 0 2px #00c8ff, 0 0 4px #00c8ff, 0 0 6px #00c8ff, 0 0 12px rgba(0,200,255,0.55)"
};

const gameTitle = {
  color: "#00c8ff",
  textShadow: "0 0 1px #00c8ff, 0 0 4px rgba(0,200,255,0.45)",
  marginBottom: "15px"
};

const panelStyle = {
  background: "#1e1e1e",
  padding: "20px 30px",
  borderRadius: "10px",
  border: "2px solid #00c8ff",
  boxShadow: "0 8px 24px rgba(0, 200, 255, 0.25)",
  color: "#fff",
  textAlign: "center",
  maxWidth: "480px",
  zIndex: 1
};

const overlayStyle = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.65)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "12px"
};

const buttonStyle = {
  padding: "10px 16px",
  marginTop: "12px",
  background: "#00c8ff",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  cursor: "pointer",
  color: "#000",
  boxShadow: "0 6px 16px rgba(0,200,255,0.35)"
};

// Fade transitions
const fadeIn = { opacity: 1, transform: "scale(1)", transition: "opacity 220ms ease, transform 220ms ease" };
const fadeOut = { opacity: 0, transform: "scale(0.985)", transition: "opacity 220ms ease, transform 220ms ease" };
const fadeInUp = { opacity: 1, transform: "translateY(0)", transition: "opacity 260ms ease, transform 260ms ease" };
const fadeOutDown = { opacity: 0, transform: "translateY(6px)", transition: "opacity 220ms ease, transform 220ms ease" };
