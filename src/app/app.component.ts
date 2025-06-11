import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {FirewallEntity} from '../game/game-entities/firewall.entity';
import {VirusEntity} from '../game/game-entities/virus.entity';
import {DaemonEntity} from '../game/game-entities/daemon.entity';
import {DatabaseEntity} from '../game/game-entities/database.entity';
import {GridEntity} from '../game/game-entities/grid.entity';
import {BorderEntity} from '../game/game-entities/border.entity';

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

  private virus!: VirusEntity;
  private daemon1!: DaemonEntity;
  private daemon2!: DaemonEntity;
  private firewall!: FirewallEntity;
  private database!: DatabaseEntity;
  private grid!: GridEntity;
  private border!: BorderEntity;

  ngAfterViewInit(): void {
    this.resizeCanvasToFullscreen();
    this.virus = new VirusEntity(this.ctx);
    this.daemon1 = new DaemonEntity(this.ctx);
    this.daemon2 = new DaemonEntity(this.ctx);
    this.firewall = new FirewallEntity(this.ctx);
    this.database = new DatabaseEntity(this.ctx);
    this.grid = new GridEntity(this.ctx);
    this.border = new BorderEntity(this.ctx);
    requestAnimationFrame(this.animate);
  }

  @HostListener('window:resize')
  onResize() {
    this.resizeCanvasToFullscreen();
    this.draw();
  }

  private animate = (timestamp: number) => {
    this.draw();

    this.border.draw(0, 0, timestamp);
    this.grid.draw(0, 0, timestamp);
    this.virus.draw(this.grid.cells[3][3].x, this.grid.cells[3][3].y, timestamp);
    this.daemon1.draw(this.grid.cells[5][1].x, this.grid.cells[5][1].y, timestamp);
    this.daemon2.draw(this.grid.cells[1][2].x, this.grid.cells[1][2].y, timestamp);
    this.firewall.draw(this.grid.cells[2][5].x, this.grid.cells[2][5].y, timestamp);
    this.database.draw(this.grid.cells[4][5].x, this.grid.cells[4][5].y, timestamp);

    requestAnimationFrame(this.animate);
  };

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
  }

}
