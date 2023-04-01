import React from "react"
import classnames from "classnames"
import { INTERFACE_STATE } from "./constants"
import { humanize, round } from '@alesmenzel/number-format';
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
    
    const nowClassnames = classnames({ "button-component": true, active: (currentView == INTERFACE_STATE.NOW) })

    return (
      <div className="full-screen transparent ui-wrapper">
        <div className="view-picker-interface">
          <div className={classnames({ "button-component": true, active: (currentView == INTERFACE_STATE.ALL_TIME) })} onClick={this.onViewChange(INTERFACE_STATE.ALL_TIME)}>
            All Time
          </div>
          <div className={classnames({ "button-component": true, active: (currentView == INTERFACE_STATE.ONE_WEEK) })} onClick={this.onViewChange(INTERFACE_STATE.ONE_WEEK)}>
            1 Week
          </div>
          <div className={classnames({ "button-component": true, active: (currentView == INTERFACE_STATE.ONE_DAY) })} onClick={this.onViewChange(INTERFACE_STATE.ONE_DAY)}>
            1 Day
          </div>
          <div className={classnames({ "button-component": true, active: (currentView == INTERFACE_STATE.NOW) })} onClick={this.onViewChange(INTERFACE_STATE.NOW)}>
            Now (Bet)
          </div>
        </div>

        <div className="house-candy-interface">
          <div className="content-component">
            { `House Candy: ${format(houseCandy)}` }
          </div>
        </div>

        <div className="betting-interface">
          <div className="content-component wide betting-summary">
            <div>Your candy: {yourCandy}</div>
            { betAmount > 0 && <div>(With bet reduced to {yourCandy - betAmount})</div>}
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
                <div className="content-component-row highlight-value">{(1 / probability) * betAmount}</div>
              </div>
            </div>

            <div className="place-bet-button">
              <div className="button-component button-wide">Bet</div>
            </div>
          </div>
        </div>

      </div>
    )
  }
} 