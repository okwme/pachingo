import * as PIXI from 'pixi.js'
import * as random from "canvas-sketch-util/random"
import delay from 'delay'

export default class Background extends PIXI.Container {
  constructor() {
    super()

    this.container = new PIXI.Container()
    this.bgSprite = new PIXI.Sprite(PIXI.Loader.shared.resources["Background"].texture)
    this.bgSprite.anchor.set(0, 0.5)
    this.bgScale = window.innerWidth / this.bgSprite.texture.width
    this.bgSprite.scale.set(this.bgScale)
    this.bgSprite.position.set(0, 0)

    this.container.addChild(this.bgSprite)

    window.PACHINGO.moveUp = this.moveUp.bind(this)
    window.PACHINGO.moveDown = this.moveDown.bind(this)

    this.bgGraphics = new PIXI.Graphics()
    for (let i = 0; i < 500; i++) {
      let x = random.range(0, this.bgSprite.texture.width * this.bgScale)
      let y = random.range(0, this.bgSprite.texture.height * this.bgScale)
      this.bgGraphics.lineStyle(1, 0xd2d2d2, random.range(0.2, 0.5))

      this.bgGraphics.moveTo(x, y - 12)
      this.bgGraphics.lineTo(x, y + 12)

      this.bgGraphics.moveTo(x - 5, y)
      this.bgGraphics.lineTo(x + 5, y)
    }

    // this.bgGraphics.anchor.set(0, 0.5)
    this.bgGraphics.position.set(0, 0)
    // this.container.addChild(this.bgGraphics)

    this.addChild(this.container)
  }

  async moveUp(initialDelay) {
    await delay(initialDelay)
    const newPos = this.container.position.y - 1500
    this.container.position.y = newPos
  }

  async moveDown(initialDelay) {
    await delay(initialDelay)
    const newPos = this.container.position.y + 1500
    this.container.position.y = newPos
  }
}