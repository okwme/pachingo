import React, { useState } from "react";
import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import PixiWrapper from "./PixiWrapper.jsx";
import UIWrapper from "./UIWrapper.jsx"
import { INTERFACE_STATE } from "./constants.js"

export const App = () => {

  const [currentView, setCurrentView] = useState(INTERFACE_STATE.NOW)

  const {
    components: { CounterTable },
    singletonEntity,
    network: { signer },
    worldSend,
  } = useMUD();

  const counter = useComponentValue(CounterTable, singletonEntity);

  const onBet = (timeSteps : Number, predictedValue : Number, betAmount : Number) : any => {
    console.log('Sending bet: ', timeSteps, predictedValue, betAmount)
  }

  const onViewChange = (newView : any) => {
    setCurrentView(newView)
  }

  return (
    <>
      <PixiWrapper/>
      <UIWrapper currentView={currentView} onViewChange={onViewChange}/>
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
