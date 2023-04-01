import React, { useState } from "react";
import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import PixiWrapper from "./PixiWrapper.jsx";
import UIWrapper from "./UIWrapper.jsx"
import { INTERFACE_STATE } from "./constants.js"

// Using a global context to easily pass callbacks around to Pixi... not ideal but it'll do for now.
window.PACHINGO = {}

export const App = () => {

  const [currentView, setCurrentView] = useState(INTERFACE_STATE.NOW)

  const {
    components: { CounterTable },
    singletonEntity,
    network: { signer },
    worldSend,
  } = useMUD();

  // TODO (cezar): Currently adding mock state variables here. They will eventually come from MUD
  const counter = useComponentValue(CounterTable, singletonEntity);
  const houseCandy = 1320000
  const yourCandy = 325
  const [betAmount, setBetAmount] = useState(5)
  const [probability, setProbability] = useState(0.125)
  const [selectedNode, setSelectedNode] = useState({ column: -1, row: -1, probability: 0 })
  // shiiiiii  
  window.PACHINGO.setSelectedNode = setSelectedNode

  const onBet = (timeSteps : Number, predictedValue : Number, betAmount : Number) : any => {
    console.log('Sending bet: ', timeSteps, predictedValue, betAmount)
  }

  const onViewChange = (newView : any) => {
    setCurrentView(newView)
  }

  return (
    <>
      <PixiWrapper selectedNode={selectedNode}/>
      <UIWrapper 
        currentView={currentView} 
        onViewChange={onViewChange}
        houseCandy={houseCandy}
        yourCandy={yourCandy}
        betAmount={betAmount}
        setBetAmount={setBetAmount}
        probability={selectedNode.probability}
      />
      {/* <div className="full-screen transparent">
        <div>
          Counters: <span>{counter?.value ?? "??"}</span>
        </div>
        <button
          type="button"
          onClick={async (event) => {
            event.preventDefault();

            // Create a World contract instance
            const s = signer.get();
            if (!s) throw new Error("No signer");

            const tx = await worldSend("increment", []);

            console.log("increment tx", tx);
            console.log("increment result", await tx.wait());
          }}
        >
          Increment
        </button>
      </div> */}
    </>
  );
};
