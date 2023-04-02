import React from "react"
import classnames from "classnames"
import { INTERFACE_STATE } from "./constants"
import { humanize, round } from '@alesmenzel/number-format';
import CandyIcon from "./pixi/assets/candy_icon.png"
import HouseIcon from "./pixi/assets/house_icon.png"
import { ethers } from 'ethers'
const format = humanize();

const formatProbability = (p) => {
  if (p == 0) return "-"
  let pct = p * 100
  return `${pct.toFixed(1)}%`
}

export default class UIWrapper extends React.Component {
  onViewChange = (view) => () => {
    this.props.onViewChange(view)
  }
  render() {
    const { bankAmount, currentView, houseCandy, userBalance, betAmount, setBetAmount, probability, onBet, betDisabled } = this.props

    const payoutAmount = probability == 0 ? "-" : ((1 / probability) * betAmount).toFixed(2)

    const nowClassnames = classnames({ "button-component": true, active: (currentView == INTERFACE_STATE.NOW) })

    const bankHasEnough = parseFloat(bankAmount) > parseFloat(payoutAmount)
    const cantBet = betDisabled || !bankHasEnough


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
              <img src={HouseIcon} />
            </div>
            <div className="house-candy-text">{`House Candy: ${(ethers.utils.formatEther(houseCandy))}`}</div>
            <div className="candy-icon">
              <div><img src={CandyIcon} className="" /></div>
            </div>
          </div>
        </div>

        <div className="betting-interface">
          <div className="content-component wide betting-summary">
            <div>
              <img src={CandyIcon} className="candy-image" />
            </div>
            <div>
              <div>{userBalance} candies</div>
              {betAmount > 0 && <div style={{ color: "#AAAEB2" }}>({userBalance - betAmount} after current bet)</div>}
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
                <input max={userBalance} type="number" className="input-component content-component-row" value={betAmount} onChange={(e) => setBetAmount(e.target.value)}></input>
                <div className="content-component-row highlight-value">{formatProbability(probability)}</div>
                <div className={"content-component-row highlight-value" + (!bankHasEnough && ' red')}>{payoutAmount}</div>
              </div>
            </div>

            <div className={"place-bet-button " + (cantBet && 'disabled')}>
              <div onClick={cantBet ? () => { } : onBet} className="overlay-button button-wide">Bet</div>
            </div>
          </div>
        </div>

      </div>
    )
  }
} 