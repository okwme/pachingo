import * as PIXI from 'pixi.js'
import GraphNode from './GraphNode'

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
      this.currentlySelectedNode.setSelected(false)
      if (this.currentlySelectedNode.row == selectedNode.row && this.currentlySelectedNode.column == selectedNode.column) {
        return
      } else {
        this.currentlySelectedNode = null
      }
    }

    if (!this.nodes[selectedNode.column][selectedNode.row]) return

    this.currentlySelectedNode = this.nodes[selectedNode.column][selectedNode.row]
    this.currentlySelectedNode.setSelected(true)
  }

  onClick = () => {

  }

  tick() {

  }
}