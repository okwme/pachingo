import React from "react"
import classnames from "classnames"
import { INTERFACE_STATE } from "./constants"
import { humanize, round } from '@alesmenzel/number-format';
import CandyIcon from "./pixi/assets/candy_icon.png"
import HouseIcon from "./pixi/assets/house_icon.png"
const format = humanize();

const formatProbability = (p) => {
  let pct = p * 100
  return `${pct.toFixed(1)}%`
}

export default class UIWrapper extends React.Component {
  onViewChange = (view) => () => {
    this.props.onViewChange(view)
  }
  render() {
    const { currentView, houseCandy, yourCandy, betAmount, setBetAmount, probability } = this.props

    console.log("Probability: ", probability)
    
    const nowClassnames = classnames({ "button-component": true, active: (currentView == INTERFACE_STATE.NOW) })

    return (
      <div className="full-screen transparent ui-wrapper">
        <div className="view-picker-interface">
          <div className={classnames({ "button-component": true, active: (currentView == INTERFACE_STATE.ALL_TIME) })} onClick={this.onViewChange(INTERFACE_STATE.ALL_TIME)}>
            All Bets
          </div>
          <div className={classnames({ "button-component": true, active: (currentView == INTERFACE_STATE.NOW) })} onClick={this.onViewChange(INTERFACE_STATE.NOW)}>
            Now (Bet)
          </div>
        </div>

        <div className="house-candy-interface">
          <div className="content-component component-house-candy">
            <div className="house-face">
              <img src={HouseIcon}/>
            </div>
            <div className="house-candy-text">{ `House Candy: ${format(houseCandy)}` }</div>
            <div className="candy-icon">
              <div><img src={CandyIcon} className=""/></div>
            </div>
          </div>
        </div>

        <div className="betting-interface">
          <div className="content-component wide betting-summary">
            <div>
              <img src={CandyIcon} className="candy-image"/>
            </div>
            <div>
              <div>{yourCandy} candies</div>
              { betAmount > 0 && <div style={{ color: "#AAAEB2" }}>({yourCandy - betAmount} with bet)</div>}
            </div>
          </div>

          <div className="content-component wide place-bet">
            <div className="place-bet-interface">
              <div className="content-component-column">
                <div className="content-component-row">Bet</div>
                <div className="content-component-row">Probability</div>
                <div className="content-component-row">Payout</div>
              </div>

              <div className="content-component-column">
                <input className="input-component content-component-row" value={betAmount} onChange={(e) => setBetAmount(parseFloat(e.target.value))}></input>
                <div className="content-component-row highlight-value">{formatProbability(probability)}</div>
                <div className="content-component-row highlight-value">{((1 / probability) * betAmount).toFixed(2)}</div>
              </div>
            </div>

            <div className="place-bet-button">
              <div className="overlay-button button-wide">Bet</div>
            </div>
          </div>
        </div>

      </div>
    )
  }
} 