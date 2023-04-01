import * as PIXI from 'pixi.js'
import { getProbabilityForCoordinates } from '../constants'

export default class GraphNode extends PIXI.Container {
  constructor(noColumns, noRows, column, row, columnGap, rowGap, radius, color = 0xffffff) {
    super()
    this.noColumns = noColumns
    this.noRows = noRows
    this.column = column
    this.row = row
    this.radius = radius
    this.interactive = true

    this.nodeGraphics = new PIXI.Graphics();
    this.nodeGraphics.beginFill(color)
    this.nodeGraphics.drawCircle(0, 0, radius)
    this.nodeGraphics.scale.set(1)
    this.nodeGraphics.cacheAsBitmap = true
    this.addChild(this.nodeGraphics);

    this.interactive = true
    this.buttonMode = true
    this.on('pointerdown', this.onClick)

    // No edges for last column
    if (column != noColumns) {
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

    this.selectedGraphics = new PIXI.Graphics();
    this.selectedGraphics.beginFill(0xff0000)
    this.selectedGraphics.drawCircle(0, 0, radius * 0.75)
    this.selectedGraphics.scale.set(1)
    this.selectedGraphics.cacheAsBitmap = true
    this.selectedGraphics.alpha = 0
    this.addChild(this.selectedGraphics);
  }

  async transitionIn(duration) {

  }

  async transitionOut(duration) {

  }

  setSelected(isSelected) {
    if (isSelected) this.selectedGraphics.alpha = 1
    else this.selectedGraphics.alpha = 0
  }

  onClick(e) {
    console.log('Clicked on: ', this.column, this.row)
    let selection = { row: this.row, column: this.column, probability: getProbabilityForCoordinates(this.column, this.row) }
    console.log("Sel: ", selection)
    window.PACHINGO.setSelectedNode(selection)
  }

  tick() {

  }
}