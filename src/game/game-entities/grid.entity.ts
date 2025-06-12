import {GameEntity} from '../game-entity';

export class GridEntity implements GameEntity {

  position = { x: 0, y: 0 };
  cells: { x: number; y: number; size: number, gameEntity?: GameEntity }[][] = [];

  constructor(public ctx: CanvasRenderingContext2D) {
    this.initCells();
  }

  draw(timestamp: number): void {
    this.cells = [];
    const ctx = this.ctx;
    ctx.save();

    const cellSize = 120;
    const cols = 7;
    const rows = 7;

    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let y = 0; y < rows; y++) {
      this.cells.push([]);
      for (let x = 0; x < cols; x++) {
        const px = x * cellSize + (width - cols * cellSize) / 2;
        const py = y * cellSize + (height - rows * cellSize) / 2;

        this.cells[y].push({ x: px + cellSize / 2, y: py + cellSize / 2, size: cellSize });

        this.drawBackgroundTint(ctx, px, py, cellSize);

        ctx.strokeStyle = `rgba(0, 255, 0, ${0.4 + Math.sin((timestamp + x * y * 13) / 500) * 0.2})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(
          px + Math.sin(timestamp / 1000 + x) * 0.5,
          py + Math.cos(timestamp / 900 + y) * 0.5,
          cellSize,
          cellSize
        );

        this.drawGlitchArtifacts(ctx, px, py, cellSize);
      }
    }

    ctx.restore();
  }

  private initCells() {
    const cellSize = 120;
    const cols = 7;
    const rows = 7;

    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let y = 0; y < rows; y++) {
      this.cells.push([]);
      for (let x = 0; x < cols; x++) {
        const px = x * cellSize + (width - cols * cellSize) / 2;
        const py = y * cellSize + (height - rows * cellSize) / 2;

        this.cells[y].push({ x: px + cellSize / 2, y: py + cellSize / 2, size: cellSize });
      }
    }
  }

  private drawBackgroundTint(ctx: CanvasRenderingContext2D, x: number, y: number, cellSize: number) {
    const flicker = Math.random() * 0.1;
    ctx.fillStyle = `rgba(10, 10, 10, ${0.2 + flicker})`;
    ctx.fillRect(x, y, cellSize, cellSize);
  }

  private drawGlitchArtifacts(ctx: CanvasRenderingContext2D, x: number, y: number, cellSize: number) {
    ctx.fillStyle = 'rgba(0, 255, 70, 0.4)';
    ctx.font = '12px monospace';
    const chars = ['▒', '░', '*', '>', '#', '&', 'Φ'];
    const ch = chars[Math.floor(Math.random() * chars.length)];
    if (Math.random() > 0.8) {
      ctx.fillText(ch, x + Math.random() * cellSize * 0.6, y + Math.random() * cellSize * 0.8);
    }
  }
}
