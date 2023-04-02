import * as PIXI from 'pixi.js'
import Graph from './Graph';
import CreatureBody from './CreatureBody';

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


    this.creatureBody = new CreatureBody([0, 1])
    this.addChild(this.creatureBody)
    this.creatureBody.position.set(this.W * 0.5, this.H / 2)
    this.creatureBody.scale.set(0.1)
    // this.twoNode.x = this.oneNode.getBounds().x + this.oneNode.getBounds().width
    // this.twoNode.y = this.oneNode.getBounds().y //+ this.oneNode.getBounds().height / 2
  }

  setSelectedNode(selectedNode) {
    this.graph.setSelectedNode(selectedNode)
  }

  tick() {
    const now = (new Date()).getTime()
    this.creatureBody.tick()
    // this.creatureBody.scale.set((Math.sin(now / 1000) + 1) * 0.2 + 0.1)
  }
}