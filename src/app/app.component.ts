import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {FirewallEntity} from '../game/game-entities/firewall.entity';
import {VirusEntity} from '../game/game-entities/virus.entity';
import {DaemonEntity} from '../game/game-entities/daemon.entity';
import {DatabaseEntity} from '../game/game-entities/database.entity';
import {GridEntity} from '../game/game-entities/grid.entity';
import {BorderEntity} from '../game/game-entities/border.entity';
import {VirusAgentService} from '../services/virus-agent/virus-agent.service';
import {Percept} from '../services/virus-agent/entities/percept';
import {AudioService} from '../services/audio/audio.service';
import {DashboardEntity} from '../game/game-entities/dashboard.entity';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(private agent: VirusAgentService, private audioService: AudioService) {
  }

  private ctx!: CanvasRenderingContext2D;

  private virus!: VirusEntity;
  private daemon1!: DaemonEntity;
  private daemon2!: DaemonEntity;
  private firewall1!: FirewallEntity;
  private firewall2!: FirewallEntity;
  private database!: DatabaseEntity;
  private grid!: GridEntity;
  private border!: BorderEntity;
  private dashboard!: DashboardEntity;

  ngAfterViewInit(): void {
    this.resizeCanvasToFullscreen();
    this.virus = new VirusEntity(this.ctx);
    this.daemon1 = new DaemonEntity(this.ctx);
    this.daemon2 = new DaemonEntity(this.ctx);
    this.firewall1 = new FirewallEntity(this.ctx);
    this.firewall2 = new FirewallEntity(this.ctx);
    this.database = new DatabaseEntity(this.ctx);
    this.grid = new GridEntity(this.ctx);
    this.border = new BorderEntity(this.ctx);
    this.dashboard = new DashboardEntity(this.ctx);

    setInterval(() => this.fixedUpdate(), 500);

    requestAnimationFrame(this.animate);
    this.virus.position = this.grid.cells[3][3];
  }

  @HostListener('window:resize')
  onResize() {
    this.resizeCanvasToFullscreen();
    this.draw();
  }

  private animate = (timestamp: number) => {
    this.daemon1.position = this.grid.cells[1][4];
    this.grid.cells[1][4].gameEntity = this.daemon1;
    this.daemon2.position = this.grid.cells[5][1];
    this.grid.cells[5][1].gameEntity = this.daemon2;
    this.firewall1.position = this.grid.cells[2][2];
    this.grid.cells[2][2].gameEntity = this.firewall1;
    this.firewall2.position = this.grid.cells[3][5];
    this.grid.cells[3][6].gameEntity = this.firewall2;
    this.database.position = this.grid.cells[4][4];
    this.grid.cells[4][4].gameEntity = this.database;
    this.dashboard.position = { x: window.innerWidth - 340, y: 100 };

    this.gameLoop(timestamp);

    this.draw();

    this.border.draw(timestamp);
    this.grid.draw(timestamp);
    this.virus.draw(timestamp);
    this.daemon1.draw(timestamp);
    this.daemon2.draw(timestamp);
    this.firewall1.draw(timestamp);
    this.firewall2.draw(timestamp);
    this.database.draw(timestamp);
    this.dashboard.draw(timestamp);

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

  private gameLoop(timestamp: number) {

  }

  private createPercept() {
    const percept: Percept = {daemonScan: false, firewallGlitch: false, databasePort: false};
    if(this.grid.cells[this.agent.position[1]][this.agent.position[0]].gameEntity instanceof DatabaseEntity) {
      percept.databasePort = true;
    }
    const adjacentCells = this.getAdjacentCells({x: this.agent.position[0], y: this.agent.position[1]});
    for (const cell of adjacentCells) {
      if (this.grid.cells[cell.x][cell.y].gameEntity instanceof DaemonEntity) {
        percept.daemonScan = true;
      }
      if (this.grid.cells[cell.x][cell.y].gameEntity instanceof FirewallEntity) {
        percept.firewallGlitch = true;
      }
    }
    return percept;
  }

  private fixedUpdate() {
    const percept = this.createPercept();
    this.dashboard.percept = percept;
    const [x, y] = this.agent.perceive(percept);
    this.virus.position = this.grid.cells[x][y];
    if( this.grid.cells[x][y].gameEntity instanceof DatabaseEntity) {
      this.database.isVisible = false;
    }
    this.dashboard.percept = this.createPercept();
    if(!this.database.isVisible && this.agent.position[0] === 3 && this.agent.position[1] === 3) {
      this.virus.isSystemBreached = true;
      this.dashboard.isSystemBreached = true;
    }
  }

  private getAdjacentCells(cell: { x: number; y: number }): { x: number; y: number }[] {
    const deltas = [
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 }
    ];

    return deltas
      .map(({ dx, dy }) => ({ x: cell.x + dx, y: cell.y + dy }))
      .filter(({ x, y }) => x >= 0 && y >= 0 && x < 7 && y < 7);
  }

}
