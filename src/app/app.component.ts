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


  ngAfterViewInit(): void {
    this.resizeCanvasToFullscreen();
    this.draw();
  }

  @HostListener('window:resize')
  onResize() {
    this.resizeCanvasToFullscreen();
    this.draw();
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

    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.fillStyle = 'lime';
    this.ctx.font = '48px sans-serif';
    this.ctx.fillText('Hacking into the mainframe...', 100, 100);
  }
}
