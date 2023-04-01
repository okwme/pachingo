import * as PIXI from 'pixi.js'
import CreatureWing from './CreatureWing'

export default class CreatureNode extends PIXI.Container {
  constructor(nodeIndex) {
    super()

    this.nodeIndex = nodeIndex

    this.bodyPartSprite = new PIXI.Sprite(PIXI.Loader.shared.resources["BodyPart"].texture)
    this.bodyPartSprite.anchor.set(0.5)
    this.bodyPartSprite.position.set(0, 0)

    this.topWing = new CreatureWing()
    this.topWing.position.set(0, -this.bodyPartSprite.texture.height / 2 + 50)
    
    this.bottomWing = new CreatureWing()
    this.bottomWing.rotation = Math.PI
    this.bottomWing.position.set(0, this.bodyPartSprite.texture.height / 2 - 50)
    

    this.addChild(this.bodyPartSprite)
    this.addChild(this.topWing)
    this.addChild(this.bottomWing)


    // this.position.set(500, 500)
    // this.scale.set(0.2)
  }

  tick() {
    const now = (new Date()).getTime() - this.nodeIndex * 700
    const now2 = now + 400
    this.bottomWing.rotation += (Math.sin(now / 600) / 2000)
    this.topWing.rotation -= (Math.sin(now2 / 600) / 2000)

    // this.rotation += (Math.cos(now / 1500) / 6400)
    this.scale.set(0.2 * (1 + (Math.sin(now / 1400) + 1) / 32))

    this.children.forEach(c => { if (c.tick) c.tick() })
  }
}