import * as PIXI from 'pixi.js'
import Graph from './Graph';
import CreatureNode from './CreatureNode';

export default class AppContainer extends PIXI.Container {
  constructor(width, height) {
    super()
    this.W = width;
    this.H = height;

    this.background = new PIXI.Graphics();
    this.background.beginFill(0x020202)
    this.background.drawRect(0, 0, this.W, this.H)
    this.addChild(this.background);

    this.graph = new Graph(7, 150, 200, 30, 0xffffff)
    this.addChild(this.graph)
    this.graph.position.x = this.W / 2
    this.graph.position.y = this.H / 2

    this.oneNode = new CreatureNode(1)
    this.addChild(this.oneNode)
    this.oneNode.position.set(500, this.H / 2)

    this.twoNode = new CreatureNode(0)
    this.addChild(this.twoNode)
    this.twoNode.position.set(685, this.H / 2 - 100)
    // this.twoNode.x = this.oneNode.getBounds().x + this.oneNode.getBounds().width
    // this.twoNode.y = this.oneNode.getBounds().y //+ this.oneNode.getBounds().height / 2
  }

  setSelectedNode(selectedNode) {
    this.graph.setSelectedNode(selectedNode)
  }

  tick() {
    this.oneNode.tick()
    this.twoNode.tick()
  }
}