import * as PIXI from 'pixi.js'

export default class AppContainer extends PIXI.Container {
  constructor(width, height) {
    super()
    this.W = width;
    this.H = height;

    this.graphics = new PIXI.Graphics();

    this.graphics.beginFill(0xff0000)
    this.graphics.drawRect(0, 0, 500, 500)

    this.addChild(this.graphics);
  }

  tick() {
    
  }
}