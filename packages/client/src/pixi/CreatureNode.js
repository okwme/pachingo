import * as PIXI from 'pixi.js'
import CreatureWing from './CreatureWing'
import { range } from "canvas-sketch-util/random"
import * as TWEEN from '@tweenjs/tween.js'
import { pifyTween } from './pixiUtils'
import * as math from "canvas-sketch-util/math"

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

    this.td = 600
    this.ad = 2000

    // this.position.set(500, 500)
    // this.scale.set(0.2)
  }

  async setJointUp(isUp) {

    let duration = 0.5
    let delay = 0.1
    await pifyTween(new TWEEN.Tween(this.joint.position)
    .to({ y: (isUp ? -1 : 1) * this.getCoreHeight() / 4 }, duration * 1000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .delay(delay * 1000)
    .start())

    // this.joint.position.y = (isUp ? -1 : 1) * this.getCoreHeight() / 4
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

    let timeDiv = 200
    let ampDiv = 800
    if (window.creatureWingParams && window.creatureWingParams.timeDivider) {
      timeDiv = window.creatureWingParams.timeDivider
      ampDiv = window.creatureWingParams.amplitudeDivider
    }

    let damping = 0
    this.td = damping * this.td + (1 - damping) * timeDiv
    this.ad = damping * this.ad + (1 - damping) * ampDiv

    this.bottomWing.rotation += (Math.sin(now / this.td) / this.ad)
    this.bottomWing.rotation = math.clamp(this.bottomWing.rotation, Math.PI - 0.2, Math.PI + 0.2)
    this.topWing.rotation -= (Math.sin(now2 / this.td) / this.ad)
    this.topWing.rotation = math.clamp(this.topWing.rotation, -0.2, 0.2)
    this.joint.rotation += this.jointRotationSpeed
    // this.rotation += (Math.cos(now / 1500) / 6400)
    // this.scale.set(0.2 * (1 + (Math.sin(now / 1400) + 1) / 32))

    this.children.forEach(c => { if (c.tick) c.tick() })
  }
}