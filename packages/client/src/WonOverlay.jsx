import React from 'react'
import classnames from "classnames"

export default class WonOverlay extends React.Component {
  render() {
    const { isWonActive, setIsWonActive } = this.props
    return (
      <div className={classnames({ "full-screen": true, "won-overlay": true, "inactive": !isWonActive })}>
        <div className="content-dialog">
          <h1>You have won!</h1>
          Your winnings have been collected and added to the blockchain.
          <div className="overlay-button" onClick={() => { setIsWonActive(false) }}>Continue</div>
        </div>
      </div>
    )
  }
}