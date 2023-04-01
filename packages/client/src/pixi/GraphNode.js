import * as PIXI from 'pixi.js'

export default class GraphNode extends PIXI.Container {
  constructor(noColumns, column, row, columnGap, rowGap, radius, color = 0xffffff) {
    super()
    this.column = column
    this.row = row
    this.radius = radius
    this.interactive = true

    this.nodeGraphics = new PIXI.Graphics();
    this.nodeGraphics.beginFill(color)
    this.nodeGraphics.drawCircle(0, 0, radius)
    this.addChild(this.nodeGraphics);

    this.interactive = true
    this.buttonMode = true
    this.on('pointerdown', this.onClick)

    // No edges for last column
    if (column == noColumns) return;

    const lineWidth = 2

    this.topEdgeGraphics = new PIXI.Graphics()
    this.topEdgeGraphics.lineStyle(lineWidth, color, 1)
    this.topEdgeGraphics.moveTo(0, 0)
    this.topEdgeGraphics.lineTo(columnGap, -rowGap / 2)
    this.topEdgeGraphics.cacheAsBitmap = true
    this.addChild(this.topEdgeGraphics)

    this.bottomEdgeGraphics = new PIXI.Graphics()
    this.bottomEdgeGraphics.lineStyle(lineWidth, color, 1)
    this.bottomEdgeGraphics.moveTo(0, 0)
    this.bottomEdgeGraphics.lineTo(columnGap, +rowGap / 2)
    this.bottomEdgeGraphics.cacheAsBitmap = true
    this.addChild(this.bottomEdgeGraphics)
  }

  onClick(e) {
    console.log('Clicked on: ', this.column, this.row)
  }

  tick() {

  }
}