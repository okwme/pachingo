import * as PIXI from 'pixi.js'
import Graph from './Graph';
import Creature from './Creature';

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


    // this.creatureHead.rotation = -0.4
    // this.twoNode.x = this.oneNode.getBounds().x + this.oneNode.getBounds().width
    // this.twoNode.y = this.oneNode.getBounds().y //+ this.oneNode.getBounds().height / 2
    this.creature = new Creature()
    this.addChild(this.creature)
    this.creature.position.set(this.W * 0.55 , this.H / 2)
    this.creature.scale.set(0.04)
  }

  setSelectedNode(selectedNode) {
    this.graph.setSelectedNode(selectedNode)
  }

  tick() {
    const now = (new Date()).getTime()
    this.creature.tick()
    // this.creatureBody.scale.set((Math.sin(now / 1000) + 1) * 0.2 + 0.1)
  }
}