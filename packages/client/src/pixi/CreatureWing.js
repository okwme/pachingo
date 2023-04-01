import * as PIXI from 'pixi.js'

export default class CreatureWing extends PIXI.Container {
  constructor() {
    super()

    this.wingBoneSprite = new PIXI.Sprite(PIXI.Loader.shared.resources["WingBone"].texture)
    this.wingBoneSprite.anchor.set(0.5, 1)
    this.wingBoneSprite.position.set(0, 0)

    this.wingEndSprite = new PIXI.Sprite(PIXI.Loader.shared.resources["WingEnd"].texture)
    this.wingEndSprite.anchor.set(0.5, 0.72)
    this.wingEndSprite.position.set(0, -this.wingBoneSprite.texture.height)
    this.wingEndSprite.rotation = 0

    this.addChild(this.wingBoneSprite)
    this.addChild(this.wingEndSprite)

    // this.anchor.set(0.5, 1)

    // this.position.set(500, 500)
    // this.scale.set(0.2)
  }
}