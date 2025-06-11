import {GameEntity} from '../game-entity';

export class DatabaseEntity implements GameEntity {

  constructor(public ctx: CanvasRenderingContext2D) { }

  draw(x: number, y: number, timestamp: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    const coreSize = 30;

    this.drawAura(ctx, 0, 0, coreSize, timestamp);
    this.drawCrystalBody(ctx, timestamp, coreSize);
    this.drawShards(ctx, timestamp, coreSize);
    this.drawShine(ctx, coreSize, timestamp);

    ctx.restore();
  }

  private drawAura(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, timestamp: number): void {
    const pulse = 2 + Math.sin(timestamp / 300) * 2;
    const auraGradient = ctx.createRadialGradient(x, y, size * 0.5, x, y, size + pulse * 2);
    auraGradient.addColorStop(0, 'rgba(0, 255, 100, 0.5)');
    auraGradient.addColorStop(1, 'rgba(0, 255, 100, 0)');
    ctx.fillStyle = auraGradient;
    ctx.beginPath();
    ctx.arc(x, y, size + pulse * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawCrystalBody(ctx: CanvasRenderingContext2D, timestamp: number, coreSize: number): void {
    ctx.save();
    ctx.rotate(timestamp / 4000);
    ctx.beginPath();
    const facets = [
      { x: 0, y: -coreSize * 1.2 },
      { x: coreSize * 0.7, y: -coreSize * 0.4 },
      { x: coreSize * 0.4, y: coreSize * 0.8 },
      { x: 0, y: coreSize * 1.2 },
      { x: -coreSize * 0.4, y: coreSize * 0.8 },
      { x: -coreSize * 0.7, y: -coreSize * 0.4 }
    ];
    ctx.moveTo(facets[0].x, facets[0].y);
    for (let pt of facets.slice(1)) {
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();

    const crystalGradient = ctx.createLinearGradient(-coreSize, -coreSize, coreSize, coreSize);
    crystalGradient.addColorStop(0, '#a0ffc0');
    crystalGradient.addColorStop(1, '#20ff90');
    ctx.fillStyle = crystalGradient;
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawShards(ctx: CanvasRenderingContext2D, timestamp: number, coreSize: number): void {
    const shardCount = 30;
    for (let i = 0; i < shardCount; i++) {
      const angle = (Math.PI * 2 * i) / shardCount + Math.sin(timestamp / 1500 + i) * 0.3;
      const orbitRadius = coreSize + 25 + Math.cos(timestamp / 1700 + i * 1.5) * 3;
      const shardX = Math.cos(angle) * orbitRadius;
      const shardY = Math.sin(angle) * orbitRadius;

      const shardAngle = angle + timestamp / 6000;

      ctx.save();
      ctx.translate(shardX, shardY);
      ctx.rotate(shardAngle);

      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(2, 0);
      ctx.lineTo(0, 4);
      ctx.lineTo(-2, 0);
      ctx.closePath();
      ctx.fillStyle = `rgba(50, 255, 50, ${Math.max(0.3, Math.random())})`;
      ctx.fill();
      ctx.restore();
    }
  }

  private drawShine(ctx: CanvasRenderingContext2D, coreSize: number, timestamp: number): void {
    ctx.beginPath();
    ctx.rotate(timestamp / 4000);
    ctx.moveTo(0, -coreSize * 0.6);
    ctx.lineTo(0, coreSize * 0.6);
    ctx.strokeStyle = `rgba(200, 255, 200, ${0.3 + 0.2 * Math.sin(timestamp / 150)})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

}
