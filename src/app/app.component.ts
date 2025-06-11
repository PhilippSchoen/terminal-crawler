import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {VirusService} from '../services/game-entities/virus/virus.service';
import {FirewallService} from '../services/game-entities/firewall/firewall.service';
import {DaemonService} from '../services/game-entities/daemon/daemon.service';
import {DatabaseService} from '../services/game-entities/database/database.service';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;

  private cachedAddressesTop: string[] = [];
  private cachedAddressesBottom: string[] = [];
  private cachedAddressesLeft: string[] = [];
  private cachedAddressesRight: string[] = [];
  private lastAddressUpdate = 0;

  constructor(private virus: VirusService, private firewall: FirewallService, private daemon: DaemonService, private database: DatabaseService) {
  }

  ngAfterViewInit(): void {
    this.resizeCanvasToFullscreen();
    this.virus.ctx = this.ctx;
    this.firewall.ctx = this.ctx;
    this.daemon.ctx = this.ctx;
    this.database.ctx = this.ctx;
    requestAnimationFrame(this.animate);
  }

  @HostListener('window:resize')
  onResize() {
    this.resizeCanvasToFullscreen();
    this.draw();
  }

  private animate = (timestamp: number) => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (timestamp - this.lastAddressUpdate > 200) {
      this.cachedAddressesTop = this.generateAddressRow(width);
      this.cachedAddressesBottom = this.generateAddressRow(width);
      this.cachedAddressesLeft = this.generateAddressColumn(height);
      this.cachedAddressesRight = this.generateAddressColumn(height);
      this.lastAddressUpdate = timestamp;
    }

    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.drawFrame();
    this.drawKernelGrid(this.ctx, timestamp);
    this.virus.draw(width / 2, height / 2, timestamp);
    this.daemon.draw(width / 3.6, height / 2.74, timestamp);
    this.firewall.draw(width / 1.64, height / 1.57, timestamp);
    this.database.draw(width / 1.64, height / 2.73, timestamp);

    requestAnimationFrame(this.animate);
  };

  private generateAddressRow(width: number): string[] {
    const addresses = [];
    for (let x = 60; x < width - 120; x += 70) {
      addresses.push(this.getRandomHexAddress());
    }
    return addresses;
  }

  private generateAddressColumn(height: number): string[] {
    const addresses = [];
    for (let y = 60; y < height - 125; y += 70) {
      addresses.push(this.getRandomHexAddress());
    }
    return addresses;
  }

  private resizeCanvasToFullscreen(): void {
    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    this.ctx = canvas.getContext('2d')!;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  private draw(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.drawFrame();
    this.drawKernelGrid(this.ctx, Date.now());
    this.virus.draw(width / 2, height / 2, Date.now());
    this.daemon.draw(width / 3.6, height / 2.74, Date.now());
    this.firewall.draw(width / 1.64, height / 1.57, Date.now());
    this.database.draw(width / 1.5, height / 3, Date.now());
  }

  private drawFrame(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.fillStyle = 'lime';
    this.ctx.strokeStyle = 'lime';
    this.ctx.strokeRect(50, 50, width - 100, height - 100);

    this.ctx.font = '12px sans-serif';
    for (let i = 0, x = 60; x < width - 120; x += 70, i++) {
      this.ctx.fillText(this.cachedAddressesTop[i], x, 70);
    }

    for (let i = 0, x = width - 125; x > 70; x -= 70, i++) {
      this.ctx.fillText(this.cachedAddressesBottom[i], x, height - 65);
    }

    for (let i = 0, y = 60; y < height - 125; y += 70, i++) {
      this.ctx.save();
      this.ctx.translate(70, y + 115);
      this.ctx.rotate(-Math.PI / 2);
      this.ctx.fillText(this.cachedAddressesLeft[i], 0, 0);
      this.ctx.restore();
    }

    for (let i = 0, y = height - 125; y > 70; y -= 70, i++) {
      this.ctx.save();
      this.ctx.translate(width - 70, y - 55);
      this.ctx.rotate(Math.PI / 2);
      this.ctx.fillText(this.cachedAddressesRight[i], 0, 0);
      this.ctx.restore();
    }
  }

  private getRandomHexAddress(): string {
    return '0x' + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  }

  drawKernelGrid(ctx: CanvasRenderingContext2D, time: number) {
    ctx.save();

    const cellSize = 120;
    const cols = 7;
    const rows = 7;

    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = x * cellSize + (width - cols * cellSize) / 2;
        const py = y * cellSize + (height - rows * cellSize) / 2;

        // Flickering background tint
        const flicker = Math.random() * 0.1;
        ctx.fillStyle = `rgba(10, 10, 10, ${0.2 + flicker})`;
        ctx.fillRect(px, py, cellSize, cellSize);

        // Glitchy green grid lines
        ctx.strokeStyle = `rgba(0, 255, 0, ${0.4 + Math.sin((time + x * y * 13) / 500) * 0.2})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(
          px + Math.sin(time / 1000 + x) * 0.5,
          py + Math.cos(time / 900 + y) * 0.5,
          cellSize,
          cellSize
        );

        // Random ASCII glitch artifacts
        ctx.fillStyle = 'rgba(0, 255, 70, 0.4)';
        ctx.font = '12px monospace';
        const chars = ['▒', '░', '*', '>', '#', '&', 'Φ'];
        const ch = chars[Math.floor(Math.random() * chars.length)];
        if (Math.random() > 0.8) {
          ctx.fillText(ch, px + Math.random() * cellSize * 0.6, py + Math.random() * cellSize * 0.8);
        }
      }
    }

    ctx.restore();
  }

}
