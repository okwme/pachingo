import * as PIXI from 'pixi.js'
import CreatureWing from './CreatureWing'
import { range } from "canvas-sketch-util/random"

export default class CreatureNode extends PIXI.Container {
  constructor(nodeIndex) {
    super()

    this.nodeIndex = nodeIndex
    this.jointRadius = 150
    this.jointRotationSpeed = range(0.002, 0.007)

    this.bodyPartSprite = new PIXI.Sprite(PIXI.Loader.shared.resources["BodyPart"].texture)
    this.bodyPartSprite.anchor.set(0.5)
    this.bodyPartSprite.position.set(0, 0)

    this.topWing = new CreatureWing()
    this.topWing.position.set(0, -this.bodyPartSprite.texture.height / 2 + 50)
    
    this.bottomWing = new CreatureWing()
    this.bottomWing.rotation = Math.PI
    this.bottomWing.position.set(0, this.bodyPartSprite.texture.height / 2 - 50)

    this.joint = new PIXI.Graphics()
    // this.joint.beginFill(0xffffff)
    // this.joint.lineStyle(4, 0xffffff, 1)
    this.jointSmallRadius = 15

    this.joint.lineStyle(4, 0xffffff, 1)
    for (let angle = 0; angle <= 2 * Math.PI + Math.PI / 32; angle += Math.PI / 12) {
      let x = this.jointRadius * Math.cos(angle)
      let y = this.jointRadius * Math.sin(angle)
      this.joint.drawCircle(x, y, this.jointSmallRadius)
    }

    // this.joint.drawCircle(0, 0, this.jointRadius)
    this.joint.position.set(this.jointRadius / 2 + this.getCoreWidth() / 2 + 90, 0)
    this.setJointUp(true)
    
    this.addChild(this.joint)
    this.addChild(this.bodyPartSprite)
    this.addChild(this.topWing)
    this.addChild(this.bottomWing)

    if (nodeIndex == 1) this.joint.alpha = 0

    // this.position.set(500, 500)
    // this.scale.set(0.2)
  }

  setJointUp(isUp) {
    this.joint.position.y = (isUp ? -1 : 1) * this.getCoreHeight() / 4
  }

  async updatePosition(newY, isJointUp) {

  }

  getCoreHeight() {
    return this.bodyPartSprite.texture.height
  }

  getCoreWidth() {
    return this.bodyPartSprite.texture.width
  }

  tick() {
    const now = (new Date()).getTime() - this.nodeIndex * 700
    const now2 = now + 400
    this.bottomWing.rotation += (Math.sin(now / 600) / 2000)
    this.topWing.rotation -= (Math.sin(now2 / 600) / 2000)
    this.joint.rotation += this.jointRotationSpeed
    // this.rotation += (Math.cos(now / 1500) / 6400)
    // this.scale.set(0.2 * (1 + (Math.sin(now / 1400) + 1) / 32))

    this.children.forEach(c => { if (c.tick) c.tick() })
  }
}