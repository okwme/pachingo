import * as PIXI from 'pixi.js'
import CreatureBody from './CreatureBody';
import CreatureHead from './CreatureHead'
import delay from "delay"

export default class Creature extends PIXI.Container {
  constructor(initialValues) {
    super()

    this.container = new PIXI.Container()

    this.addChild(this.container)

    this.creatureBody = new CreatureBody(initialValues)
    this.container.addChild(this.creatureBody)
    this.creatureBody.scale.set(1)

    this.creatureHead = new CreatureHead()
    this.container.addChild(this.creatureHead)
    // this.creatureHead.position.set(this.W * 0.35, this.H / 2)
    this.creatureHead.scale.set(3)

    this.container.x = -this.creatureHead.getBounds().width

    this.interactive = true
    this.on("click", this.onClick)
  }

  onClick() {
    this.addNodeValue(this.creatureBody.values[this.creatureBody.values.length - 1] + ((Math.random() > 0.5) ? 1 : -1))
  }

  async addNode(wentUp, delayVal) {
    await delay(delayVal)
    await this.addNodeValue(this.creatureBody.values[this.creatureBody.values.length - 1] + ((wentUp) ? -1 : 1))
  }

  async addNodeValue(value) {
    await this.creatureBody.addNode(value)
  }

  tick() {
    this.creatureBody.tick()
    this.creatureHead.tick()
  }
}