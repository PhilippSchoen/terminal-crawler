export interface GameEntity {
  ctx?: CanvasRenderingContext2D;
  position: { x: number; y: number };

  draw(timestamp: number): void;
}
