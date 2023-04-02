import * as PIXI from 'pixi.js'
import CreatureBody from './CreatureBody';
import CreatureHead from './CreatureHead'

export default class Creature extends PIXI.Container {
  constructor() {
    super()

    this.container = new PIXI.Container()

    this.addChild(this.container)

    this.creatureBody = new CreatureBody([-2, -1, 0, 1, 0, 1])
    this.container.addChild(this.creatureBody)
    this.creatureBody.scale.set(1)

    this.creatureHead = new CreatureHead()
    this.container.addChild(this.creatureHead)
    // this.creatureHead.position.set(this.W * 0.35, this.H / 2)
    this.creatureHead.scale.set(3)

    this.container.x = -this.creatureHead.getBounds().width
  }

  tick() {
    this.creatureBody.tick()
    this.creatureHead.tick()
  }
}