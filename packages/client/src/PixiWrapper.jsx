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
import MainLoopSound from "./pixi/assets/bakground_ambience_for_gameplay_final.mp3"
import WinSound from "./pixi/assets/win_pop_up_sound_final.wav"
import LoseSound from "./pixi/assets/lose_sound.wav"
import BetSound from "./pixi/assets/place_bed_sound_final.wav"
import BallSound from "./pixi/assets/red_ball_pachinko_final.wav"
import LineSound from "./pixi/assets/red_line_pachinko_final.wav"
import LandingSound from "./pixi/assets/landing_screen_music_loop_final.wav"
import { sound } from '@pixi/sound';

if (!window.PACHINGO) window.PACHINGO = {}
window.PACHINGO.sound = sound

export default class PixiWrapper extends React.Component {
  constructor(props) {
    super(props)
    this._canvas = null
  }

  state = {
    appWidth: window.innerWidth,
    appHeight: window.innerHeight
  }

  onKeyDown = async (e) => { 
    console.log(e.key)
    const deltaX = this.props.selectedNode.column - 1
    if (e.key == "1") {
      await this._pAppContainer.setStateWon(deltaX, 1, 0, 1, 100, [false, true, true, false, true])
      window.PACHINGO.onWin()
    }
    if (e.key == "2") {
      await this._pAppContainer.setStateLost(deltaX, 1, 0, 1, 100, [false, true, true, false, true])
      window.PACHINGO.onLose()
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

    sound.add("MainLoop", MainLoopSound)
    sound.add("WinSound", WinSound)
    sound.add("LoseSound", LoseSound)
    sound.add("BetSound", BetSound)
    sound.add("BallSound", BallSound)
    sound.add("LineSound", LineSound)
    sound.add("LandingSound", LandingSound)
    sound.play("LandingSound", { loop: true, volume: 0.6 })

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
        //loader.add("MainLoop", MainLoopSound)
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

  async componentDidUpdate(oldProps) {
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
        await this._pAppContainer.setStateWon(deltaX, deltaY, odds, resolved, wager, wentUp)
        // window.PACHINGO.setIsWonActive(true)
        window.PACHINGO.onWin()
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