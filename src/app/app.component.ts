import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';

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

  ngAfterViewInit(): void {
    this.resizeCanvasToFullscreen();
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
    this.drawVirus(width / 2, height / 2, timestamp);
    this.drawDaemon(width / 3.6, height / 2.74, timestamp);
    this.drawKernelGrid(this.ctx, timestamp);
    this.drawFirewall(width / 1.64, height / 1.57, timestamp);

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
    this.drawVirus(width / 2, height / 2, Date.now());
    this.drawDaemon(width / 3, height / 3, Date.now());
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

  private drawVirus(x: number, y: number, time: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.scale(0.75, 0.75);
    x /= 0.75;
    y /= 0.75;

    const pulse = 10 + Math.sin(time / 300) * 5;

    // Core nucleus
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 40 + pulse);
    gradient.addColorStop(0, 'rgba(255, 0, 100, 0.9)');
    gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.arc(x, y, 40 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Dynamic wavy tendrils
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
    ctx.lineWidth = 1.5;
    const tendrils = 12;
    const segments = 15;
    const baseRadius = 40 + pulse;

    for (let i = 0; i < tendrils; i++) {
      const baseAngle = (Math.PI * 2 * i) / tendrils;

      ctx.beginPath();
      let prevX = x + Math.cos(baseAngle) * (baseRadius * Math.random());
      let prevY = y + Math.sin(baseAngle) * (baseRadius * Math.random());
      ctx.moveTo(prevX, prevY);

      for (let s = 1; s <= segments; s++) {
        const segmentLength = (60 + 10 * Math.sin(time / 400 + i + s)) / segments;
        const angleOffset = Math.sin(time / 200 + i * 0.5 + s * 0.7) * 0.3;
        const angle = baseAngle + angleOffset;

        const nextX = prevX + Math.cos(angle) * segmentLength;
        const nextY = prevY + Math.sin(angle) * segmentLength;

        ctx.lineTo(nextX, nextY);

        prevX = nextX;
        prevY = nextY;
      }

      ctx.stroke();

    }

    for (let i = 0; i < 3; i++) {
      const r = 50 + i * 10 + Math.sin(time / (200 + i * 50)) * 2;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, ${50 + i * 50}, ${100 + i * 50}, 0.15)`;
      ctx.setLineDash([Math.random() * 4 + 2, Math.random() * 6 + 3]);
      ctx.lineWidth = 0.5;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawDaemon(x: number, y: number, time: number) {
    const ctx = this.ctx;
    ctx.save();

    const coreRadius = 20;
    const bladeCount = 8;
    const bladeLength = 30;
    const rotationSpeed = 0.0015;

    ctx.translate(x, y);

    // Pulsating core glow - fiery reds
    const pulse = 5 + Math.sin(time / 300) * 3;
    const coreGradient = ctx.createRadialGradient(0, 0, coreRadius - pulse, 0, 0, coreRadius + pulse);
    coreGradient.addColorStop(0, 'rgba(255, 50, 50, 1)');  // bright red
    coreGradient.addColorStop(1, 'rgba(120, 0, 0, 0)');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Central eye background - glowing fiery orange iris
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 0, 0, 0.9)'; // dark orange glow
    ctx.arc(0, 0, coreRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Sharp, slitted pupil (rotating slightly)
    const pupilLength = coreRadius * 1.1;
    const pupilWidth = coreRadius * 0.3;
    const pupilRotation = Math.sin(time / 500) * 0.3; // subtle rotation

    ctx.save();
    ctx.rotate(pupilRotation);

    ctx.beginPath();
    // Draw a vertical sharp diamond shape for pupil
    ctx.moveTo(0, -pupilLength / 2);
    ctx.lineTo(pupilWidth / 2, 0);
    ctx.lineTo(0, pupilLength / 2);
    ctx.lineTo(-pupilWidth / 2, 0);
    ctx.closePath();

    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.restore();

    // Rotating jagged blades around the core - deep and bright reds
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(180, 0, 0, 0.9)';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';  // bright red blades

    ctx.rotate(time * rotationSpeed);

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

    ctx.restore();
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

  private drawFirewall(x: number, y: number, time: number) {
    const ctx = this.ctx;
    ctx.save(); // <-- outer save (translate)

    ctx.translate(x, y);

    const pulse = 4 + Math.sin(time / 200) * 3;
    const noiseFactor = 5;
    const radius = 45;

    // Construct the chaotic firewall path
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.1) {
      const r =
        radius +
        Math.sin(time / 300 + a * 5) * pulse +
        Math.sin(a * 9 + time / 500) * noiseFactor;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r * 1.2;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    // Fill core with flickering noise first
    const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, radius);
    gradient.addColorStop(0, '#220000');
    gradient.addColorStop(1, '#110000');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Clip to the firewall shape
    ctx.save();  // <-- save for clipping
    ctx.clip();

    // Draw the grid inside the clipped firewall area
    const gridSpacing = 10;
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(255, 0, 0, ${0.05 + 0.1 * Math.sin(time / 200)})`;

    // Vertical grid lines
    for (let gx = -radius; gx <= radius; gx += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(gx, -radius * 1.2);
      ctx.lineTo(gx, radius * 1.2);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let gy = -radius * 1.2; gy <= radius * 1.2; gy += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(-radius, gy);
      ctx.lineTo(radius, gy);
      ctx.stroke();
    }

    ctx.restore();  // <-- restore after clipping

    // Rebuild firewall path for border stroke
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.1) {
      const r =
        radius +
        Math.sin(time / 300 + a * 5) * pulse +
        Math.sin(a * 9 + time / 500) * noiseFactor;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r * 1.2;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glitch shards
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

    // Flickering scan line
    const sweepY = Math.sin(time / 400) * radius * 0.9;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.06)';
    ctx.fillRect(-radius, sweepY - 3, radius * 2, 6);

    ctx.restore(); // <-- restore outer context (translate)
  }

}
