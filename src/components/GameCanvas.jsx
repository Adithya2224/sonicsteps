// src/components/GameCanvas.jsx
import React, { useRef, useEffect } from "react";

const CELL_SIZE = 32;
const REVEAL_TIME = 800;

export default function GameCanvas({ maze, player, goal, revealedTimes, pulses }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!maze.length) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();

    // Draw revealed walls
    ctx.strokeStyle = "#fff";
    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (now - revealedTimes[y][x] > REVEAL_TIME) return;
        const px = x * CELL_SIZE, py = y * CELL_SIZE;
        ctx.beginPath();
        if (cell.walls[0]) { ctx.moveTo(px, py); ctx.lineTo(px + CELL_SIZE, py); }
        if (cell.walls[1]) { ctx.moveTo(px + CELL_SIZE, py); ctx.lineTo(px + CELL_SIZE, py + CELL_SIZE); }
        if (cell.walls[2]) { ctx.moveTo(px + CELL_SIZE, py + CELL_SIZE); ctx.lineTo(px, py + CELL_SIZE); }
        if (cell.walls[3]) { ctx.moveTo(px, py + CELL_SIZE); ctx.lineTo(px, py); }
        ctx.stroke();
      });
    });

    // Goal if revealed
    if (now - revealedTimes[goal.y][goal.x] <= REVEAL_TIME) {
      ctx.fillStyle = "green";
      ctx.fillRect(goal.x * CELL_SIZE + 8, goal.y * CELL_SIZE + 8, CELL_SIZE - 16, CELL_SIZE - 16);
    }

    // Player
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(
      player.x * CELL_SIZE + CELL_SIZE / 2,
      player.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 4, 0, Math.PI * 2
    );
    ctx.fill();

    // Pulses ripple
    pulses.forEach(p => {
      const progress = (now - p.start) / REVEAL_TIME;
      const radius = progress * 5 * CELL_SIZE;
      const alpha = Math.max(0, 1 - progress);
      ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        p.x * CELL_SIZE + CELL_SIZE / 2,
        p.y * CELL_SIZE + CELL_SIZE / 2,
        radius, 0, Math.PI * 2
      );
      ctx.stroke();
    });
  }, [maze, player, revealedTimes, goal, pulses]);

  // Width/height based on maze size
  const width = maze[0]?.length ? maze[0].length * CELL_SIZE : 0;
  const height = maze.length ? maze.length * CELL_SIZE : 0;

  return <canvas ref={ref} width={width} height={height} />;
}
