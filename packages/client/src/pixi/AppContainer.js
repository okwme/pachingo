import * as PIXI from 'pixi.js'
import Graph from './Graph';
import Creature from './Creature';
import * as TWEEN from '@tweenjs/tween.js'
import { pifyTween } from './pixiUtils'
import Background from './Background'

export default class AppContainer extends PIXI.Container {
  constructor(width, height) {
    super()
    this.W = width;
    this.H = height;

    // this.background = new PIXI.Graphics();
    // this.background.beginFill(0x020202)
    // this.background.drawRect(0, 0, this.W, this.H)
    // this.addChild(this.background);

    this.background = new Background()
    this.addChild(this.background)

    this.graph = new Graph(7, 150, 200, 30, 0xffffff)
    this.addChild(this.graph)
    this.graph.position.x = this.W / 2
    this.graph.position.y = this.H / 2


    // this.creatureHead.rotation = -0.4
    // this.twoNode.x = this.oneNode.getBounds().x + this.oneNode.getBounds().width
    // this.twoNode.y = this.oneNode.getBounds().y //+ this.oneNode.getBounds().height / 2
    this.creature = new Creature([-2, -1, 0, 1, 0, 1])
    this.addChild(this.creature)
    this.creature.position.set(this.W * 0.55 , this.H / 2)
    this.creature.scale.set(0.15)

    this.graph.creature = this.creature
  }

  setSelectedNode(selectedNode) {
    this.graph.setSelectedNode(selectedNode)
  }

  setStatePending(deltaX, deltaY, odds, resolved, wager, wentUp) {

  }

  async setStateWon(deltaX, deltaY, odds, resolved, wager, wentUp) {
    await this.advanceState(deltaX, deltaY, wentUp)
  }

  async setStateLost(deltaX, deltaY, odds, resolved, wager, wentUp) {
    await this.advanceState(deltaX, deltaY, wentUp)
  }

  async advanceState(deltaX, deltaY, wentUp, hasWon) {
    if (this._isStateChanging) return
    this._isStateChanging = true
    await this.graph.setWinningPath(deltaX, deltaY, wentUp)
    this._isStateChanging = false
  }

  tick() {
    const now = (new Date()).getTime()
    this.creature.tick()
    // this.creatureBody.scale.set((Math.sin(now / 1000) + 1) * 0.2 + 0.1)
  }

  async setInterfaceNow(isNow) {
    if (!window.creatureWingParams) {
      window.creatureWingParams = {}
    }
    window.creatureWingParams = { timeDivider: 30, amplitudeDivider: 20 }
    if (isNow) {

      let t1 = pifyTween(new TWEEN.Tween(this.creature.scale)
      .to({ x: 0.15, y: 0.15 }, 2 * 1000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .delay(0)
      .start())
  
      let t2 = pifyTween(new TWEEN.Tween(this.graph)
      .to({ alpha: 1 }, 2 * 1000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .delay(1000)
      .start())

      let t3 = pifyTween(new TWEEN.Tween(this.creature.position)
      .to({ x: this.W * 0.55, y: this.H / 2 }, 1.75 * 1000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .delay(100)
      .start())

      await Promise.all([t1, t2, t3])

      // this.graph.alpha = 1
      // this.creature.scale.set(0.15)
      // this.creature.position.set(this.W * 0.55 , this.H / 2)
    } else {
      // this.graph.alpha = 0
      // this.creature.scale.set(0.08)
      // this.creature.position.set(this.W * 0.85 , this.H / 2)
      let t1 = pifyTween(new TWEEN.Tween(this.creature.scale)
      .to({ x: 0.08, y: 0.08 }, 2 * 1000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .delay(500)
      .start())
  
      let t2 = pifyTween(new TWEEN.Tween(this.graph)
      .to({ alpha: 0 }, 0.75 * 1000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .delay(0)
      .start())

      let t3 = pifyTween(new TWEEN.Tween(this.creature.position)
      .to({ x: this.W * 0.85, y: this.H / 2 }, 2 * 1000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .delay(500)
      .start())

      await Promise.all([t1, t2, t3])

    }

    window.creatureWingParams = { timeDivider: 200, amplitudeDivider: 800 }
  }
}