import { Injectable } from '@angular/core';
import { Fact } from './entities/fact';
import { Percept } from './entities/percept';

@Injectable({
  providedIn: 'root'
})
export class VirusAgentService {
  kb: Map<string, Fact> = new Map<string, Fact>();
  position: [number, number] = [3, 3];
  private hasReachedDatabase = false;

  perceive(percept: Percept): [number, number] {
    const [x, y] = this.position;
    const key = `${x},${y}`;
    this.updateKnowledgeBase(key, percept);
    this.inferKnowledge();

    if (percept.databasePort) {
      this.hasReachedDatabase = true;
    }

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

      if (percept.firewallGlitch) {
        if (!adjacentCell.safe && !adjacentCell.certainFirewall && !adjacentCell.visited) {
          adjacentCell.mayBeFirewall = true;
        }
      }

      if (percept.daemonScan) {
        if (!adjacentCell.safe && !adjacentCell.certainDaemon && !adjacentCell.visited) {
          adjacentCell.mayBeDaemon = true;
        }
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

      if (fact.hasDaemonScan && possibleDaemon.length === 1) {
        const [i, j] = possibleDaemon[0];
        const f = this.kb.get(`${i},${j}`)!;
        f.certainDaemon = true;
        f.mayBeDaemon = false;
        this.kb.set(`${i},${j}`, f);
      }

      if (fact.hasFirewallGlitch && possibleFirewall.length === 1) {
        const [i, j] = possibleFirewall[0];
        const f = this.kb.get(`${i},${j}`)!;
        f.certainFirewall = true;
        f.mayBeFirewall = false;
        this.kb.set(`${i},${j}`, f);
      }

      if (!fact.hasDaemonScan && !fact.hasFirewallGlitch) {
        for (const [i, j] of adj) {
          const k = `${i},${j}`;
          const f = this.kb.get(k) || {} as Fact;
          f.safe = true;
          this.kb.set(k, f);
        }
      }
    }
  }

  private planNextMove(): [number, number] {
    const goal: [number, number] | null = this.hasReachedDatabase
      ? [3, 3]
      : this.findClosestUnvisitedSafeTile();

    if (!goal) return this.position;

    const path = this.aStar(this.position, goal);
    if (path.length > 1) {
      this.position = path[1];
    }

    return this.position;
  }

  private findClosestUnvisitedSafeTile(): [number, number] | null {
    let queue: [[number, number], number][] = [[this.position, 0]];
    const visited = new Set<string>();
    visited.add(`${this.position[0]},${this.position[1]}`);

    while (queue.length > 0) {
      const [[x, y]] = queue.shift()!;
      const key = `${x},${y}`;
      const cell = this.kb.get(key);
      if (cell?.safe && !cell.visited) {
        return [x, y];
      }

      for (const [nx, ny] of this.getAdjacentTiles(x, y)) {
        const nKey = `${nx},${ny}`;
        if (!visited.has(nKey)) {
          visited.add(nKey);
          queue.push([[nx, ny], 0]);
        }
      }
    }

    return null;
  }

  private aStar(start: [number, number], goal: [number, number]): [number, number][] {
    const openSet = new Set<string>();
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    const startKey = `${start[0]},${start[1]}`;
    const goalKey = `${goal[0]},${goal[1]}`;
    openSet.add(startKey);
    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(start, goal));

    while (openSet.size > 0) {
      let currentKey = [...openSet].reduce((a, b) =>
        (fScore.get(a)! < fScore.get(b)!) ? a : b
      );

      if (currentKey === goalKey) {
        return this.reconstructPath(cameFrom, currentKey).map(k =>
          k.split(',').map(Number) as [number, number]
        );
      }

      openSet.delete(currentKey);
      const [x, y] = currentKey.split(',').map(Number);
      for (const [nx, ny] of this.getAdjacentTiles(x, y)) {
        const neighborKey = `${nx},${ny}`;
        const cell = this.kb.get(neighborKey);
        if (!cell || (!cell.safe && !cell.visited)) continue;

        const tentativeG = gScore.get(currentKey)! + 1;
        if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
          cameFrom.set(neighborKey, currentKey);
          gScore.set(neighborKey, tentativeG);
          fScore.set(neighborKey, tentativeG + this.heuristic([nx, ny], goal));
          openSet.add(neighborKey);
        }
      }
    }

    return []; // No path found
  }

  private heuristic(a: [number, number], b: [number, number]): number {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
  }

  private reconstructPath(cameFrom: Map<string, string>, current: string): string[] {
    const path = [current];
    while (cameFrom.has(current)) {
      current = cameFrom.get(current)!;
      path.unshift(current);
    }
    return path;
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
