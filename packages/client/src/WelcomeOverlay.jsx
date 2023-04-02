import React from 'react'
import classnames from "classnames"

export default class WelcomeOverlay extends React.Component {
  render() {
    const { isWelcomeActive, setIsWelcomeActive } = this.props
    return (
      <div className={classnames({ "full-screen": true, "won-overlay": true, "inactive": !isWelcomeActive })}>
        <div className="content-dialog">
          <h1 style={{marginBottom: '25px'}}>Hark! We bid thee welcome to Feed the Wyrm.</h1>
          Verily, the aim of this game is to nourish the wyrm, the servant of the gods of chance. Thou shalt receive 100 candies and an opportunity to test thy fortune.
          <br/><br/>
          The game doth work like unto pachinko, whereat each stage the path may ascend or descend, with an even 50/50% possibility of going either way. The farther ye wager, the more the chances be divided, and thusly thy reward shall be greater.
          <br/><br/>
          However, take heed, for the gods of chance doth favour both prosperity and adversity with equal measure.
          <div style={{marginTop: '40px'}} className="overlay-button" onClick={() => { window.PACHINGO.onDismissWelcome() }}>I Wish to Partake</div>
        </div>
      </div>
    )
  }
}