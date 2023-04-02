import * as PIXI from 'pixi.js'

export default class CreatureHead extends PIXI.Container {
  constructor() {
    super()

    this.headTop = new PIXI.Sprite(PIXI.Loader.shared.resources["HeadTop"].texture)
    this.headTop.anchor.set(0, 0.5)
    //this.bodyPartSprite.position.set(0, 0)
    this.addChild(this.headTop)

    this.headTentacles = new PIXI.Sprite(PIXI.Loader.shared.resources["HeadTentacles"].texture)
    this.headTentacles.anchor.set(0.5, 0.5)
    this.headTentacles.scale.set(0.5)
    this.headTentacles.position.set(300, -250)
    //this.bodyPartSprite.position.set(0, 0)
    this.headTop.addChild(this.headTentacles)

    this.headJaw = new PIXI.Sprite(PIXI.Loader.shared.resources["HeadJaw"].texture)
    this.headJaw.anchor.set(0, 0)
    this.headJaw.scale.set(0.8)
    this.headJaw.position.set(200, 165)
    //this.bodyPartSprite.position.set(0, 0)
    this.addChild(this.headJaw)
  }

  tick() {
    const now = (new Date()).getTime() - (-1 * 700)
    this.rotation += (Math.sin(now / 600) / 4000)

    this.headJaw.rotation += (Math.cos(now / 300) / 4000)
    if (this.headJaw.rotation < -0.1) this.headJaw.rotation = -0.1
  }
}