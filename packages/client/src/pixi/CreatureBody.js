import * as PIXI from 'pixi.js'
import CreatureNode from './CreatureNode'
import delay from "delay"

export default class CreatureBody extends PIXI.Container {
  constructor(values) {
    super()

    this.values = values
    this.container = new PIXI.Container()
    this.addChild(this.container)

    this.buildBody()

    this.interactive = true
    this.on("click", this.onClick)
    
  }

  onClick() {
    this.addNode(this.values[this.values.length - 1] + ((Math.random() > 0.5) ? 1 : -1))
  }

  buildBody() {
    let xPos = 0
    let delta = 0
    let previousDelta = null

    for (let i = this.values.length - 1; i >= 0; i--) {      
      let bodyPart = new CreatureNode(this.values.length - 1 - i)
      bodyPart.position.x = xPos - bodyPart.getCoreWidth() / 2
      bodyPart.position.y = delta * bodyPart.getCoreHeight() / 2
      this.container.addChild(bodyPart)

      let currentDelta
      if (i > 0) {
        currentDelta = (this.values[i] - this.values[i - 1])
        delta += currentDelta
      }

      if (previousDelta) {
        bodyPart.setJointUp(previousDelta > 0)
      }

      previousDelta = currentDelta
      xPos -= bodyPart.getBounds().width
    }
  }

  async addNode(value) {
    this.values.push(value)
    let newLastNode = new CreatureNode(this.values.length)
    newLastNode.position.x = -((this.values.length - 1) * newLastNode.getBounds().width) - newLastNode.getCoreWidth() / 2
    newLastNode.position.y = this.container.children[this.container.children.length - 1].y

    this.container.addChild(newLastNode)
    
    let delta = 0
    let valuesIndex = this.values.length - 1
    let previousDelta = null

    for (let i = 0; i < this.container.children.length; i++) {
      let bodyPart = this.container.children[i]
      bodyPart.position.y = delta * bodyPart.getCoreHeight() / 2

      let currentDelta
      if (valuesIndex > 0) {
        currentDelta = (this.values[valuesIndex] - this.values[valuesIndex - 1])
        delta += currentDelta
      }
      valuesIndex--

      if (previousDelta) bodyPart.setJointUp(previousDelta > 0)

      previousDelta = currentDelta
      await delay(25)
    }

    console.log(this.values)
  }

  tick() {
    this.container.children.forEach(c => { if (c.tick) c.tick() })
  }
}