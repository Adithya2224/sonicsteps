// src/game/engine.js
export function canMove(player, dir, maze) {
  const { x, y } = player;
  return !maze[y][x].walls[dir];
}

export const DIRS = {
  ArrowUp: 0,
  ArrowRight: 1,
  ArrowDown: 2,
  ArrowLeft: 3,
  w: 0,
  d: 1,
  s: 2,
  a: 3
};
