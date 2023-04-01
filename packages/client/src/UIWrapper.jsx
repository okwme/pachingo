import React from "react"
import classnames from "classnames"
import { INTERFACE_STATE } from "./constants"

export default class UIWrapper extends React.Component {
  onViewChange = (view) => () => {
    this.props.onViewChange(view)
  }
  render() {
    const { currentView } = this.props
    
    const nowClassnames = classnames({ "button-component": true, active: (currentView == INTERFACE_STATE.NOW) })

    return (
      <div className="full-screen transparent">
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
        <div className="house-candy-interface"></div>
        <div className="betting-interface"></div>
      </div>
    )
  }
} 