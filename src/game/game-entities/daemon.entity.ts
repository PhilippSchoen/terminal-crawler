import {GameEntity} from '../game-entity';

export class DaemonEntity implements GameEntity {

  position = { x: 0, y: 0 };

  constructor(public ctx: CanvasRenderingContext2D) { }

  draw(timestamp: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    this.drawCore(ctx, 0, 0, timestamp);
    this.drawEye(ctx, 0, 0, timestamp);
    this.drawRotatingBlades(ctx, 0, 0, timestamp);

    ctx.restore();
  }

  private drawCore(ctx: CanvasRenderingContext2D, x: number, y: number, timestamp: number): void {
    const coreRadius = 20;
    const pulse = 5 + Math.sin(timestamp / 300) * 3;
    const coreGradient = ctx.createRadialGradient(x, y, coreRadius - pulse, x, y, coreRadius + pulse);
    coreGradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
    coreGradient.addColorStop(1, 'rgba(120, 100, 0, 0.1)');

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(x, y, coreRadius + pulse, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawEye(ctx: CanvasRenderingContext2D, x: number, y: number, timestamp: number): void {
    const coreRadius = 20;
    const pupilLength = coreRadius * 1.1;
    const pupilWidth = coreRadius * 0.3;
    const pupilRotation = Math.sin(timestamp / 500) * 0.3; // subtle rotation
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 100, 0, 0.7)'; // dark orange glow
    ctx.arc(0, 0, coreRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.rotate(pupilRotation);

    ctx.beginPath();
    ctx.moveTo(0, -pupilLength / 2);
    ctx.lineTo(pupilWidth / 2, 0);
    ctx.lineTo(0, pupilLength / 2);
    ctx.lineTo(-pupilWidth / 2, 0);
    ctx.closePath();

    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.restore();
  }

  private drawRotatingBlades(ctx: CanvasRenderingContext2D, x: number, y: number, timestamp: number) {
    const coreRadius = 20;
    const bladeCount = 8;
    const bladeLength = 30;
    const rotationSpeed = 0.0015;

    ctx.translate(x, y);
    ctx.rotate(timestamp * rotationSpeed);

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.6)'; // bright red blades

    for (let i = 0; i < bladeCount; i++) {
      const angle = (Math.PI * 2 * i) / bladeCount;

      ctx.save();
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(coreRadius, 0);
      ctx.lineTo(coreRadius + bladeLength * 0.3, bladeLength * 0.2);
      ctx.lineTo(coreRadius + bladeLength, 0);
      ctx.lineTo(coreRadius + bladeLength * 0.3, -bladeLength * 0.2);
      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  }
}
