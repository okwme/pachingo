import * as PIXI from 'pixi.js'
import Graph from './Graph';

export default class AppContainer extends PIXI.Container {
  constructor(width, height) {
    super()
    this.W = width;
    this.H = height;

    this.background = new PIXI.Graphics();
    this.background.beginFill(0xd2f2d2)
    this.background.drawRect(0, 0, this.W, this.H)
    this.addChild(this.background);

    this.graph = new Graph(5, 150, 200, 15, 0xffffff)
    this.addChild(this.graph)
    this.graph.position.x = this.W / 2
    this.graph.position.y = this.H / 2
  }

  setSelectedNode(selectedNode) {
    this.graph.setSelectedNode(selectedNode)
  }

  tick() {

  }
}