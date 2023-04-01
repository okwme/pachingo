import React from "react";
import { useComponentValue } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import PixiWrapper from "./PixiWrapper.jsx";

export const App = () => {
  const {
    components: { CounterTable },
    singletonEntity,
    network: { signer },
    worldSend,
  } = useMUD();

  const counter = useComponentValue(CounterTable, singletonEntity);

  return (
    <>
      <PixiWrapper/>
      <div className="full-screen transparent">
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
      </div>
    </>
  );
};
