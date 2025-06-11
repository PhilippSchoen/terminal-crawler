import {GameEntity} from '../game-entity';


export class FirewallEntity implements GameEntity {

  constructor(public ctx: CanvasRenderingContext2D) { }

  draw(x: number, y: number, timestamp: number): void {
    const ctx = this.ctx;
    const radius = 45;
    const pulse = 4 + Math.sin(timestamp / 200) * 3;
    const noiseFactor = 5;

    this.drawFirewallShape(ctx, x, y, timestamp, pulse, noiseFactor, radius);
    this.drawFirewallGrid(ctx, radius, timestamp);
    this.drawFirewallBorder(ctx, radius, timestamp);
    this.drawGlitchShards(ctx, radius, timestamp);
    this.drawScanLine(ctx, radius, timestamp);
  }

  private drawFirewallShape(ctx: CanvasRenderingContext2D, x: number, y: number, timestamp: number, pulse: number, noiseFactor: number, radius: number): void {
    ctx.save();

    ctx.translate(x, y);

    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.1) {
      const r =
        radius +
        Math.sin(timestamp / 300 + a * 5) * pulse +
        Math.sin(a * 9 + timestamp / 500) * noiseFactor;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r * 1.2;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, radius);
    gradient.addColorStop(0, '#220000');
    gradient.addColorStop(1, '#110000');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.save();
  }

  private drawFirewallGrid(ctx: CanvasRenderingContext2D, radius: number, timestamp: number): void {
    ctx.clip();

    const gridSpacing = 10;
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(255, 0, 0, ${0.05 + 0.1 * Math.sin(timestamp / 200)})`;

    for (let gx = -radius; gx <= radius; gx += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(gx, -radius * 1.2);
      ctx.lineTo(gx, radius * 1.2);
      ctx.stroke();
    }

    for (let gy = -radius * 1.2; gy <= radius * 1.2; gy += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(-radius, gy);
      ctx.lineTo(radius, gy);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawFirewallBorder(ctx: CanvasRenderingContext2D, radius: number, timestamp: number): void {
    const pulse = 4 + Math.sin(timestamp / 200) * 3;
    const noiseFactor = 5;

    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.1) {
      const r =
        radius +
        Math.sin(timestamp / 300 + a * 5) * pulse +
        Math.sin(a * 9 + timestamp / 500) * noiseFactor;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r * 1.2;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  private drawGlitchShards(ctx: CanvasRenderingContext2D, radius: number, timestamp: number): void {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius * 0.9;
      const gx = Math.cos(angle) * dist;
      const gy = Math.sin(angle) * dist;
      const w = Math.random() * 6 + 2;
      const h = Math.random() * 2 + 1;
      ctx.fillStyle = `rgba(255, 0, 0, ${Math.random() * 0.15})`;
      ctx.fillRect(gx, gy, w, h);
    }
  }

  private drawScanLine(ctx: CanvasRenderingContext2D, radius: number, timestamp: number): void {
    const sweepY = Math.sin(timestamp / 400) * radius * 0.9;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.06)';
    ctx.fillRect(-radius, sweepY - 3, radius * 2, 6);
    ctx.restore();
  }
}
