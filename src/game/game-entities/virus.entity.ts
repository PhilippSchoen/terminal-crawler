import { GameEntity } from '../game-entity';

export class VirusEntity implements GameEntity {
  position = { x: 0, y: 0 };
  isSystemBreached = false;

  constructor(public ctx: CanvasRenderingContext2D) {}

  draw(timestamp: number): void {
    const ctx = this.ctx;
    let x = this.position.x;
    let y = this.position.y;
    ctx.save();
    ctx.scale(0.6, 0.6);
    x /= 0.6;
    y /= 0.6;

    const pulse = 10 + Math.sin(timestamp / 300) * 5;

    if (this.isSystemBreached) {
      this.drawBreachedCore(ctx, x, y, pulse);
      this.drawBreachedTendrils(ctx, x, y, pulse, timestamp);
      this.drawBreachedHalo(ctx, x, y, timestamp);
    } else {
      this.drawVirusCore(ctx, x, y, pulse);
      this.drawTendrils(ctx, x, y, pulse);
      this.drawHalo(ctx, x, y, timestamp);
    }

    ctx.restore();
  }

  private drawVirusCore(ctx: CanvasRenderingContext2D, x: number, y: number, pulse: number): void {
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 40 + pulse);
    gradient.addColorStop(0, 'rgba(255, 150, 0, 0.9)');
    gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.arc(x, y, 40 + pulse, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawBreachedCore(ctx: CanvasRenderingContext2D, x: number, y: number, pulse: number): void {
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 40 + pulse);
    gradient.addColorStop(0, 'rgba(0, 255, 0, 0.9)');
    gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.arc(x, y, 40 + pulse, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 5; i++) {
      const dx = x + (Math.random() - 0.5) * 60;
      const dy = y + (Math.random() - 0.5) * 60;
      const size = Math.random() * 4 + 1;
      ctx.fillStyle = 'rgba(0,255,150,0.2)';
      ctx.fillRect(dx, dy, size, size);
    }
  }

  private drawTendrils(ctx: CanvasRenderingContext2D, x: number, y: number, pulse: number): void {
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
    ctx.lineWidth = 1.5;
    this.drawTendrilSegments(ctx, x, y, pulse, 12);
  }

  private drawBreachedTendrils(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    pulse: number,
    timestamp: number
  ): void {
    ctx.strokeStyle = `rgba(0, 255, 120, ${0.4 + 0.2 * Math.sin(timestamp / 200)})`;
    ctx.lineWidth = 1.5 + Math.sin(timestamp / 300) * 0.5;
    this.drawTendrilSegments(ctx, x, y, pulse, 16);
  }

  private drawTendrilSegments(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    pulse: number,
    tendrils: number
  ): void {
    const segments = 15;
    const baseRadius = 40 + pulse;

    for (let i = 0; i < tendrils; i++) {
      const baseAngle = (Math.PI * 2 * i) / tendrils;

      ctx.beginPath();
      let prevX = x + Math.cos(baseAngle) * (baseRadius * Math.random());
      let prevY = y + Math.sin(baseAngle) * (baseRadius * Math.random());
      ctx.moveTo(prevX, prevY);

      for (let s = 1; s <= segments; s++) {
        const segmentLength = (60 + 10 * Math.sin(Date.now() / 400 + i + s)) / segments;
        const angleOffset = Math.sin(Date.now() / 200 + i * 0.5 + s * 0.7) * 0.3;
        const angle = baseAngle + angleOffset;

        const nextX = prevX + Math.cos(angle) * segmentLength;
        const nextY = prevY + Math.sin(angle) * segmentLength;

        ctx.lineTo(nextX, nextY);

        prevX = nextX;
        prevY = nextY;
      }

      ctx.stroke();
    }
  }

  private drawHalo(ctx: CanvasRenderingContext2D, x: number, y: number, timestamp: number): void {
    for (let i = 0; i < 3; i++) {
      const r = 50 + i * 10 + Math.sin(timestamp / (200 + i * 50)) * 2;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, ${50 + i * 50}, ${100 + i * 50}, 0.4)`;
      ctx.setLineDash([Math.random() * 4 + 2, Math.random() * 6 + 3]);
      ctx.lineWidth = 0.5;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private drawBreachedHalo(ctx: CanvasRenderingContext2D, x: number, y: number, timestamp: number): void {
    for (let i = 0; i < 4; i++) {
      const r = 45 + i * 12 + Math.sin(timestamp / (150 + i * 60)) * 2;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0, ${150 + i * 25}, 255, 0.3)`;
      ctx.setLineDash([2, 5]);
      ctx.lineWidth = 0.6;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
