export interface GameEntity {
  ctx?: CanvasRenderingContext2D;

  draw(x: number, y: number, timestamp: number): void;
}
