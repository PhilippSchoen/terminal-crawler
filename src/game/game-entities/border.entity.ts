import {GameEntity} from '../game-entity';

export class BorderEntity implements GameEntity {

  private cachedAddressesTop: string[] = [];
  private cachedAddressesBottom: string[] = [];
  private cachedAddressesLeft: string[] = [];
  private cachedAddressesRight: string[] = [];
  private lastAddressUpdate = 0;

  constructor(public ctx: CanvasRenderingContext2D) {}

  draw(x: number, y: number, timestamp: number): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (timestamp - this.lastAddressUpdate > 200) {
      this.cachedAddressesTop = this.generateAddressRow(width);
      this.cachedAddressesBottom = this.generateAddressRow(width);
      this.cachedAddressesLeft = this.generateAddressColumn(height);
      this.cachedAddressesRight = this.generateAddressColumn(height);
      this.lastAddressUpdate = timestamp;
    }

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

  private getRandomHexAddress(): string {
    return '0x' + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  }

}
