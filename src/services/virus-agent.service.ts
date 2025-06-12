import { Injectable } from '@angular/core';
import { Fact } from './entities/fact';
import { Percept } from './entities/percept';

@Injectable({
  providedIn: 'root'
})
export class VirusAgentService {
  kb: Map<string, Fact> = new Map<string, Fact>();
  position: [number, number] = [3, 3];

  perceive(percept: Percept) {
    const [x, y] = this.position;
    const key = `${x},${y}`;
    this.updateKnowledgeBase(key, percept);
    this.inferKnowledge();

    return this.planNextMove();
  }

  private updateKnowledgeBase(key: string, percept: Percept) {
    const cell = this.kb.get(key) || {} as Fact;
    cell.visited = true;
    cell.hasFirewallGlitch = percept.firewallGlitch;
    cell.hasDaemonScan = percept.daemonScan;
    this.kb.set(key, cell);

    const [x, y] = key.split(',').map(Number);
    const adjacentTiles = this.getAdjacentTiles(x, y);

    for (const [i, j] of adjacentTiles) {
      const adjacentKey = `${i},${j}`;
      const adjacentCell = this.kb.get(adjacentKey) || {} as Fact;

      if (percept.firewallGlitch && !adjacentCell.safe && !adjacentCell.certainFirewall) {
        adjacentCell.mayBeFirewall = true;
      }
      if (percept.daemonScan && !adjacentCell.safe && !adjacentCell.certainDaemon) {
        adjacentCell.mayBeDaemon = true;
      }

      this.kb.set(adjacentKey, adjacentCell);
    }
  }

  private inferKnowledge() {
    for (const [key, fact] of this.kb.entries()) {
      if (!fact.visited) continue;
      const [x, y] = key.split(',').map(Number);
      const adj = this.getAdjacentTiles(x, y);

      const possibleDaemon = adj.filter(([i, j]) => {
        const f = this.kb.get(`${i},${j}`);
        return f?.mayBeDaemon && !f.certainDaemon;
      });

      const possibleFirewall = adj.filter(([i, j]) => {
        const f = this.kb.get(`${i},${j}`);
        return f?.mayBeFirewall && !f.certainFirewall;
      });

      if (fact.hasDaemonScan) {
        if (possibleDaemon.length === 1) {
          const [i, j] = possibleDaemon[0];
          const f = this.kb.get(`${i},${j}`)!;
          f.certainDaemon = true;
          f.mayBeDaemon = false;
          this.kb.set(`${i},${j}`, f);
        } else {
          for (const [i, j] of adj) {
            const k = `${i},${j}`;
            const f = this.kb.get(k) || {} as Fact;
            if (!f.safe && !f.certainDaemon) {
              f.mayBeDaemon = true;
              this.kb.set(k, f);
            }
          }
        }
      } else {
        for (const [i, j] of adj) {
          const k = `${i},${j}`;
          const f = this.kb.get(k) || {} as Fact;
          f.safe = true;
          f.mayBeDaemon = false;
          this.kb.set(k, f);
        }
      }

      if (fact.hasFirewallGlitch) {
        if (possibleFirewall.length === 1) {
          const [i, j] = possibleFirewall[0];
          const f = this.kb.get(`${i},${j}`)!;
          f.certainFirewall = true;
          f.mayBeFirewall = false;
          this.kb.set(`${i},${j}`, f);
        } else {
          for (const [i, j] of adj) {
            const k = `${i},${j}`;
            const f = this.kb.get(k) || {} as Fact;
            if (!f.safe && !f.certainFirewall) {
              f.mayBeFirewall = true;
              this.kb.set(k, f);
            }
          }
        }
      } else {
        for (const [i, j] of adj) {
          const k = `${i},${j}`;
          const f = this.kb.get(k) || {} as Fact;
          f.safe = true;
          f.mayBeFirewall = false;
          this.kb.set(k, f);
        }
      }
    }
  }

  private planNextMove(): [number, number] {
    const [x, y] = this.position;
    const adjacentTiles = this.getAdjacentTiles(x, y);
    let nextTile: [number, number] | null = null;

    for (const [i, j] of adjacentTiles) {
      const key = `${i},${j}`;
      const cell = this.kb.get(key);

      if (cell && !cell.visited && !cell.mayBeFirewall && !cell.mayBeDaemon) {
        nextTile = [i, j];
        break;
      }
    }

    this.position = nextTile || this.position;

    return this.position;
  }

  private getAdjacentTiles(x: number, y: number): [number, number][] {
    return [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ].filter(([i, j]) => i >= 0 && j >= 0 && i < 7 && j < 7) as [number, number][];
  }
}
