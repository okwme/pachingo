import React from "react";
import * as PIXI from 'pixi.js'
import TWEEN from '@tweenjs/tween.js'
import FontFaceObserver from 'fontfaceobserver'
import AppContainer from "./pixi/AppContainer.js"
import WingEnd from "./pixi/assets/WingEnd.png"
import WingBone from "./pixi/assets/WingBone.png"
import BodyPart from "./pixi/assets/BodyPart.png"
import HeadTop from "./pixi/assets/HeadTop.png"
import HeadJaw from "./pixi/assets/HeadJaw.png"
import HeadTentacles from "./pixi/assets/HeadTentacles.png"

export default class PixiWrapper extends React.Component {
  constructor(props) {
    super(props)
    this._canvas = null
  }

  state = {
    appWidth: window.innerWidth,
    appHeight: window.innerHeight
  }

  onKeyDown = (e) => { 
    console.log(e.key)
    if (e.key == "w") {
      this._pAppContainer.setStateWon(4, 1, 0, 1, 100, [false, true, true, false, true])
    }
  }
  onKeyUp = (e) => { }
  onResize = (e) => {
    this.setState({ appWidth: window.innerWidth, appHeight: window.innerHeight })
    this.calculateCanvasScale()
  }
  calculateCanvasScale = () => {
    const windowW = window.innerWidth * 1
    const windowH = window.innerHeight * 1
    //const { width, height } = this.props
    const width = this.state.appWidth
    const height = this.state.appHeight
    this.canvasScale = Math.round(10000 * Math.min(windowW / width, windowH / height)) / 100.0
    this._canvas.style.transform = `scale(${this.canvasScale}%)`;
  }

  async componentDidMount() {
    this.calculateCanvasScale()
    window.addEventListener("keydown", this.onKeyDown)
    window.addEventListener("keyup", this.onKeyUp)
    window.addEventListener("resize", this.onResize)

    const { appWidth, appHeight } = this.state
    this._pixiApp = new PIXI.Application({
      view: this._canvas,
      width: appWidth,
      height: appHeight,
      resolution: 1,
      antialias: true,
      autoDensity: true
    })

    window._pixiApp = this._pixiApp

    this.W = this._pixiApp.renderer.width
    this.H = this._pixiApp.renderer.height

    try {
      await this.loadAssets()
    } catch (e) {
      console.error("Caught exception in loading assets", e)
    }

    await this.startApp()
  }

  async loadAssets() {
    return new Promise(async (res, rej) => {
      const loader = PIXI.Loader.shared
      try {
        loader.add("WingEnd", WingEnd)
        loader.add("WingBone", WingBone)
        loader.add("BodyPart", BodyPart)
        loader.add("HeadTop", HeadTop)
        loader.add("HeadJaw", HeadJaw)
        loader.add("HeadTentacles", HeadTentacles)
        loader.onComplete.add(() => { res() })
        loader.load()
      } catch (e) {
        rej()
      }  
    })
  }

  async startApp() {
    PIXI.GraphicsGeometry.BATCHABLE_SIZE = 250
    this._pAppContainer = new AppContainer(this.W, this.H)

    window._pAppContainer = this._pAppContainer
    this._pixiApp.stage.addChild(this._pAppContainer)

    this._pixiApp.ticker.add((delta) => {
      TWEEN.update()
      this._pAppContainer.tick(delta)
    })    
  }

  componentDidUpdate(oldProps) {
    if (this._pAppContainer)
      this._pAppContainer.setSelectedNode(this.props.selectedNode)

    if (oldProps.betState != this.props.betState) {
      let { deltaX, deltaY, odds, resolved, wager, wentUp } = this.props.betState
      deltaX = Number(deltaX)
      deltaY = Number(deltaY)
      odds = Number(odds)
      resolved = Number(resolved)
      wager = Nunber(resolved)

      if (resolved == 0) {
        // Unresolved
        this._pAppContainer.setStatePending(deltaX, deltaY, odds, resolved, wager, wentUp)
      } else if (resolved == 1) {
        this._pAppContainer.setStateWon(deltaX, deltaY, odds, resolved, wager, wentUp)
        // Won
      } else if (resolved == 2) {
        this._pAppContainer.setStateLost(deltaX, deltaY, odds, resolved, wager, wentUp)
        // Lost
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.onKeyDown)
    window.removeEventListener("keyup", this.onKeyUp)
    window.removeEventListener("resize", this.onResize)
  }

  render() {
    return (
      <div className="full-screen">
        <canvas ref={(r) => this._canvas = r} id="pixi-container" className="pixi-container">
        </canvas>
      </div>
    )
  }
}