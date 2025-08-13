// src/game/maze.js
export function generateMaze(width, height) {
  const maze = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({
      visited: false,
      // walls: [top, right, bottom, left]
      walls: [true, true, true, true]
    }))
  );

  const dx = [0, 1, 0, -1];
  const dy = [-1, 0, 1, 0];

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function carve(x, y) {
    maze[y][x].visited = true;
    const dirs = shuffle([0, 1, 2, 3]);
    for (const d of dirs) {
      const nx = x + dx[d];
      const ny = y + dy[d];
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && !maze[ny][nx].visited) {
        maze[y][x].walls[d] = false;
        maze[ny][nx].walls[(d + 2) % 4] = false;
        carve(nx, ny);
      }
    }
  }

  carve(0, 0);

  // Reset visited flags (not used by game logic)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      maze[y][x].visited = false;
    }
  }

  return maze;
}
