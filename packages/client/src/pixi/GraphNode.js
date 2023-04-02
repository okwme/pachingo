import * as PIXI from 'pixi.js'
import { getProbabilityForCoordinates } from '../constants'
import random, { noise2D, noise3D } from 'canvas-sketch-util/random'
import * as TWEEN from '@tweenjs/tween.js'
import { pifyTween } from './pixiUtils'
import { sound } from '@pixi/sound';
import delay from "delay"

export default class GraphNode extends PIXI.Container {
  constructor(noColumns, noRows, column, row, columnGap, rowGap, radius, color = 0xffffff) {
    super()
    this.noColumns = noColumns
    this.noRows = noRows
    this.column = column
    this.row = row
    this.radius = radius
    this.columnGap = columnGap
    this.rowGap = rowGap
    this.interactive = true
    this.edgeLineWidth = 0.5
    this.color = color

    this.nodeGraphics = new PIXI.Graphics();

      // No edges for last column
    // if (column != noColumns) {
      this.topEdgeGraphics = new PIXI.Graphics()
      this.topEdgeGraphics.lineStyle(this.edgeLineWidth, this.color, 1)
      this.topEdgeGraphics.moveTo(0, 0)
      this.topEdgeGraphics.lineTo(this.columnGap, -this.rowGap / 2)
      //this.topEdgeGraphics.drawDashLine(columnGap, -rowGap / 2, 8, 8)
      // this.topEdgeGraphics.cacheAsBitmap = true
      this.addChild(this.topEdgeGraphics)
  
      this.bottomEdgeGraphics = new PIXI.Graphics()
      this.bottomEdgeGraphics.lineStyle(this.edgeLineWidth, this.color, 1)
      this.bottomEdgeGraphics.moveTo(0, 0)
      this.bottomEdgeGraphics.lineTo(this.columnGap, +this.rowGap / 2)
      // this.bottomEdgeGraphics.cacheAsBitmap = true
      this.addChild(this.bottomEdgeGraphics)  
    // }
  
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

  drawNodeGraphics() {
    this.nodeGraphics.clear()
    this.nodeGraphics.beginFill(this.color)
    this.nodeGraphics.drawCircle(0, 0, this.radius)
  }

  drawTopEdge() {
    this.topEdgeGraphics.clear()
    this.topEdgeGraphics.lineStyle(this.edgeLineWidth, this.color, 1)
    this.topEdgeGraphics.moveTo(0, 0)
    this.topEdgeGraphics.lineTo(this.columnGap, -this.rowGap / 2)
  }

  drawBottomEdge() {
    this.bottomEdgeGraphics.clear()
    this.bottomEdgeGraphics.lineStyle(this.edgeLineWidth, this.color, 1)
    this.bottomEdgeGraphics.moveTo(0, 0)
    this.bottomEdgeGraphics.lineTo(this.columnGap, +this.rowGap / 2)
  }

  async drawSelectedGraphics() {
    this.selectedGraphics.clear()
    //this.selectedGraphics.beginFill(0xff0000)
    this.selectedGraphics.lineStyle(1, 0xff0000, 1)

    let polygon = []

    const yOffset = 0

    for (let angle = 0; angle <= 2 * Math.PI + Math.PI / 16; angle += Math.PI / 16) {

      let dX = Math.cos(angle) * this.radius
      let dY = Math.sin(angle) * this.radius

      let r = this.radius * 0.15
      const now = (new Date()).getTime()
      // for (let angle = 0; angle <= 2 * Math.PI + Math.PI / 16; angle += Math.PI / 32) {
      //   let x = r * Math.cos(angle) + dX
      //   let y = r * Math.sin(angle) + dY
  
      //   polygon.push(x + noise3D(x + 10 * this.column, y + 10 * this.row, now / 10, 0.04, 1))
      //   polygon.push(y + yOffset + noise3D(x + 10 * this.column, y + 10 * this.row, now / 10, 0.022, 5))
      // }
  
      // this.selectedGraphics.drawPolygon(polygon)
      this.selectedGraphics.drawCircle(dX, dY, r)

      await delay(40)
    }

  }

  async transitionIn(duration) {

  }

  async transitionOut(duration) {

  }

  setSelected(isSelected) {
    if (isSelected) {
      this.drawSelectedGraphics()
      this.selectedGraphics.alpha = 1
    }
    else this.selectedGraphics.alpha = 0
  }

  async setIsWinningState(isWinningState, wentUp, shouldColorEdge) {
    if (isWinningState) {

      sound.play("BallSound")
      let lineSoundPromise = async () => {
        await delay(200)
        sound.play("LineSound")        
      }
      lineSoundPromise()
      

      this.oldColor = this.color

      const pixiRGB = PIXI.utils.hex2rgb(this.color)
      this.colorRGB = { r: pixiRGB[0], g: pixiRGB[1], b: pixiRGB[2] }
      // this.color = 0x00ff00
      this.drawNodeGraphics()

      if (shouldColorEdge) {
        if (wentUp) { this.drawTopEdge() } 
        else { this.drawBottomEdge() }
      }

      const duration = 0.5
      const delayValue = 0

      await pifyTween(new TWEEN.Tween(this.colorRGB)
      .to({ r: 0, g: 1, b: 0 }, duration * 1000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .delay(delayValue * 1000)
      .onUpdate(() => { 
        // console.log(this.colorRGB)
        this.color = PIXI.utils.rgb2hex([this.colorRGB.r, this.colorRGB.g, this.colorRGB.b])
        this.drawNodeGraphics()
        if (shouldColorEdge) {
          if (wentUp) { this.drawTopEdge() } 
          else { this.drawBottomEdge() }
        }  
      })
      .start())

    } else {
      this.color = this.oldColor
      this.drawNodeGraphics()
      this.drawTopEdge()
      this.drawBottomEdge()
    }
  }

  async hide(duration, delay = 0) {
    await pifyTween(new TWEEN.Tween(this)
    .to({ alpha: 0 }, duration * 1000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .delay(delay * 1000)
    .start())
  }

  onClick(e) {
    console.log('Clicked on: ', this.column, this.row)
    let selection = { row: this.row, column: this.column, probability: getProbabilityForCoordinates(this.column, this.row) }
    console.log("Sel: ", selection)
    window.PACHINGO.setSelectedNode(selection)
    sound.play("BetSound")
  }

  tick() {
    // if (this.selectedGraphics.alpha > 0) this.drawSelectedGraphics()
  }
}