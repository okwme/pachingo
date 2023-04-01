import * as PIXI from 'pixi.js'
import { getProbabilityForCoordinates } from '../constants'
import { noise2D, noise3D } from 'canvas-sketch-util/random'

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

      // No edges for last column
    if (column != noColumns) {
      const lineWidth = 0.5

      this.topEdgeGraphics = new PIXI.Graphics()
      this.topEdgeGraphics.lineStyle(lineWidth, color, 1)
      this.topEdgeGraphics.moveTo(0, 0)
      this.topEdgeGraphics.lineTo(columnGap, -rowGap / 2)
      //this.topEdgeGraphics.drawDashLine(columnGap, -rowGap / 2, 8, 8)
      // this.topEdgeGraphics.cacheAsBitmap = true
      this.addChild(this.topEdgeGraphics)
  
      this.bottomEdgeGraphics = new PIXI.Graphics()
      this.bottomEdgeGraphics.lineStyle(lineWidth, color, 1)
      this.bottomEdgeGraphics.moveTo(0, 0)
      this.bottomEdgeGraphics.lineTo(columnGap, +rowGap / 2)
      // this.bottomEdgeGraphics.cacheAsBitmap = true
      this.addChild(this.bottomEdgeGraphics)  
    }
  
    /*

    this.nodeGraphics.lineStyle(0.5, 0xffffff, 1)
    let yOffset = 0
    for (let r = radius; r >= radius; r -= 2.75) {
      let polygon = [r, yOffset]
      this.nodeGraphics.moveTo(r, 0)
      for (let angle = 0; angle <= 2 * Math.PI + Math.PI / 16; angle += Math.PI / 32) {
        let x = r * Math.cos(angle)
        let y = r * Math.sin(angle) * 0.25
        //this.nodeGraphics.lineTo(x + noise2D(x + 10 * column, y + 10 * row, 0.04, 3), y + noise2D(x + 10 * column, y + 10 * row, 0.022, 3))
        polygon.push(x + noise2D(x + 10 * column, y + 10 * row, 0.04, 3))
        polygon.push(y + yOffset + noise2D(x + 10 * column, y + 10 * row, 0.022, 3))
      }

      yOffset -= 2.5

      // this.nodeGraphics.lineStyle()
      this.nodeGraphics.beginFill(0xffffff)
      this.nodeGraphics.drawPolygon(polygon)
    }

    */
    this.nodeGraphics.beginFill(color)
    this.nodeGraphics.drawCircle(0, 0, radius)
    this.nodeGraphics.scale.set(1)
    // this.nodeGraphics.cacheAsBitmap = true
    this.addChild(this.nodeGraphics);

    this.interactive = true
    this.buttonMode = true
    this.on('pointerdown', this.onClick)

    this.selectedGraphics = new PIXI.Graphics();
    // this.selectedGraphics.beginFill(0xff0000)
    // this.selectedGraphics.drawCircle(0, 0, radius * 0.75)
    // this.selectedGraphics.scale.set(1)
    // this.selectedGraphics.cacheAsBitmap = true
    this.drawSelectedGraphics()
    this.selectedGraphics.alpha = 0
    this.addChild(this.selectedGraphics);
  }

  drawSelectedGraphics() {
    this.selectedGraphics.clear()
    this.selectedGraphics.beginFill(0xff0000)

    let polygon = []

    const yOffset = -25

    let r = this.radius * 0.5
    const now = (new Date()).getTime()
    for (let angle = 0; angle <= 2 * Math.PI + Math.PI / 16; angle += Math.PI / 32) {
      let x = r * Math.cos(angle)
      let y = r * Math.sin(angle)

      polygon.push(x + noise3D(x + 10 * this.column, y + 10 * this.row, now / 10, 0.04, 1))
      polygon.push(y + yOffset + noise3D(x + 10 * this.column, y + 10 * this.row, now / 10, 0.022, 5))
    }

    this.selectedGraphics.drawPolygon(polygon)
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
    // if (this.selectedGraphics.alpha > 0) this.drawSelectedGraphics()
  }
}