import * as PIXI from 'pixi.js'
import GraphNode from './GraphNode'
import delay from "delay"
import { sound } from '@pixi/sound';

export default class Graph extends PIXI.Container {
  constructor(noColumns, rowGap, columnGap, nodeRadius = 20, color = 0xffffff) {
    super()


    this.noColumns = noColumns
    this.rowGap = rowGap
    this.columnGap = columnGap
    this.nodeRadius = nodeRadius
    this.color = color

    this.currentlySelectedNode = null

    this.generateNodes()
    this.generateEdges()
  }

  generateNodes() {
    this.nodes = {}
    for (let column = 1; column <= this.noColumns; column++) {
      for (let row = 1; row <= column; row++) {
        let node = new GraphNode(this.noColumns, this.noRows, column, row, this.columnGap, this.rowGap, this.nodeRadius, this.color)
        const coords = this.getGraphToSpaceCoords(column, row)
        node.position.x = coords.x
        node.position.y = coords.y
        this.addChild(node)

        if (!this.nodes[column]) this.nodes[column] = {}
        this.nodes[column][row] = node
      }
    }
  }

  generateEdges() {

  }

  getGraphToSpaceCoords(column, row) {
    // column and row are 1-indexed
    let x = column * this.columnGap
    let offset = row - column / 2
    let y = offset * this.rowGap - this.rowGap / 2

    return { x, y }
  }

  getSpaceToGraphCoords() {

  }

  setSelectedNode(selectedNode) {
    if (this.currentlySelectedNode) {
      if (this.currentlySelectedNode.row == selectedNode.row && this.currentlySelectedNode.column == selectedNode.column) {
        return
      }

      this.currentlySelectedNode.setSelected(false)
      this.currentlySelectedNode = null
    }

    if (!this.nodes[selectedNode.column]) return
    if (!this.nodes[selectedNode.column][selectedNode.row]) return

    this.currentlySelectedNode = this.nodes[selectedNode.column][selectedNode.row]
    this.currentlySelectedNode.setSelected(true)
  }

  async setWinningPath(deltaX, deltaY, wentUp) {
    let column = 1, row = 1

    for (let i = 0; i <= deltaX; i++) {
      let isFinal = (i == (deltaX))
      await this.nodes[column][row].setIsWinningState(true, wentUp[i], !isFinal)

      column++
      if (!wentUp[i]) row++
    }

    for (let i = 0; i < deltaX; i++) {
      // await this.nodes[1][1].setIsWinningState(true, wentUp[i], true)
      // await Promise.all([this.nodes[2][1 + (wentUp[i] ? 0 : 1)].setIsWinningState(true, wentUp[i], false)])
      //await this.nodes[2][1 + (wentUp[i] ? 0 : 1)].setIsWinningState(true, wentUp[i], false)
      await Promise.all([this.advanceByOneStep(wentUp[i]), this.creature.addNode(wentUp[i], 750)])

      // await this.advanceByOneStep(wentUp[i])
      // await this.creature.addNode(wentUp[i])
      column++
      if (!wentUp[i]) row++
    }
  }

  async advanceByOneStep(wentUp) {
    let rowOffset = wentUp ? 1 : 0
    let row = 1
    let column = 1

    let nodesToPurge = []
    let promises = []
    let delayAmt = 0
    let stagger = 0.15

    for (let i = 0; i < this.noColumns; i++) {
      if (i < this.noColumns - 1)
        promises.push(this.nodes[column][row].hide(0.5, delayAmt))
      nodesToPurge.push(this.nodes[column][row])
      column++
      row += rowOffset
      delayAmt += stagger
    }

    await Promise.all(promises)

    if (wentUp)
      window.PACHINGO.moveDown(0)
    else
      window.PACHINGO.moveUp(0)

    let index = 0
    for (let column = 1; column <= this.noColumns; column++) {
      for (let row = 1; row <= column; row++) {
        if (column == this.noColumns) {
          let node = new GraphNode(this.noColumns, this.noRows, column, row, this.columnGap, this.rowGap, this.nodeRadius, this.color)
          const coords = this.getGraphToSpaceCoords(column, row)
          node.position.x = coords.x
          node.position.y = coords.y
          this.nodes[column][row] = node
          this.addChild(node)
        } else {
          this.nodes[column][row] = this.nodes[column + 1][row + (wentUp ? 0 : 1)]
          this.nodes[column][row].column = column
          this.nodes[column][row].row = row
          let newPos = this.getGraphToSpaceCoords(column, row)
          this.nodes[column][row].position.x = newPos.x
          this.nodes[column][row].position.y = newPos.y
        }

        if (index % 3 == 0 && column < this.noColumns - 1) sound.play("LineSound")
        index++

        if (column < this.noColumns) {
          await delay(50)
        }
      }
    }

    nodesToPurge.forEach(n => this.removeChild(n))

    // await delay(500)
  }

  onClick = () => {

  }

  tick() {

  }
}