import { GameEntity } from '../game-entity';
import { Percept } from '../../services/virus-agent/entities/percept';

export class DashboardEntity implements GameEntity {
  constructor(public ctx: CanvasRenderingContext2D) {}

  position: { x: number; y: number } = { x: 0, y: 0 };
  percept: Percept = {
    daemonScan: false,
    firewallGlitch: false,
    databasePort: false,
  };

  draw(timestamp: number): void {
    const { ctx } = this;
    const { x, y } = this.position;
    const width = 230;
    const height = 110;

    ctx.save();
    ctx.fillStyle = '#000000dd';
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = 'lime';

    ctx.fillText('> VIRUS SYSTEM MONITOR', x + 10, y + 20);

    this.drawStatus(ctx, x + 10, y + 60, 'FIREWALL GLITCH', this.percept.firewallGlitch);
    this.drawStatus(ctx, x + 10, y + 80, 'DAEMON SCAN', this.percept.daemonScan);
    this.drawStatus(ctx, x + 10, y + 100, 'DATABASE PORT', this.percept.databasePort);

    ctx.restore();
  }

  private drawStatus(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label: string,
    active: boolean
  ) {
    ctx.fillStyle = 'lime';
    ctx.fillText(`> ${label}`, x, y);

    if (active) {
      const indicator = Math.floor(performance.now() / 200) % 2 === 0 ? 'ONLINE' : '0NL1NE';
      ctx.fillStyle = 'lime';
      ctx.fillText(`[${indicator}]`, x + 140, y);
    } else {
      ctx.fillStyle = 'red';
      ctx.fillText('[OFFLINE]', x + 140, y);
    }
  }
}
