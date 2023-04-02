import React, { useState } from "react";
import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { useMUD } from "./MUDContext";
import PixiWrapper from "./PixiWrapper.jsx";
import UIWrapper from "./UIWrapper.jsx"
import { INTERFACE_STATE } from "./constants.js"
import { Has, getComponentValueStrict } from "@latticexyz/recs";
import { ethers } from "ethers";
// Using a global context to easily pass callbacks around to Pixi... not ideal but it'll do for now.
window.PACHINGO = {}

export const App = () => {

  let bets = []

  const [currentView, setCurrentView] = useState(INTERFACE_STATE.NOW)
  // const [bankBalance, setBankBalance] = useState(0)
  // const [bankHeld, setBankHeld] = useState(0)
  const {
    components: { Bank, BetTable, OpenBet },
    // singletonEntity,
    network: { signer, blockNumber },
    worldSend,
    worldContract
  } = useMUD();

  // // TODO (cezar): Currently adding mock state variables here. They will eventually come from MUD
  // Bank.update$.subscribe((_bank) => {
  //   setBankBalance(_bank.value[0]?.balance || 0)
  //   setBankHeld(_bank.value[0]?.held || 0)

  //   var currentValue = _bank.value[0]
  //   var previousValue = _bank.value[1]
  //   console.log(`_bank updated`, currentValue, previousValue)
  //   console.log({ _bank })
  //   console.log({ bank })
  //   console.log({ bankBalance, bankHeld })
  // })

  // BetTable.update$.subscribe((_betTable) => {
  //   var currentValue = _betTable.value[0]
  //   var previousValue = _betTable.value[1]
  //   console.log(`BetTable updated`, currentValue, previousValue)
  //   console.log({ _betTable })
  //   console.log({ betTable })
  //   const entries = betTable.entries()
  //   const next = entries.next()
  //   console.log({ next })
  //   // .forEach((entry) => {
  //   //   console.log(`previous betEntry entry is `, entry)
  //   // })
  // })

  const bank = useEntityQuery([Has(Bank)])[0];
  const maybeBank = useComponentValue(Bank, bank)
  const houseCandy = (maybeBank ? maybeBank.balance - maybeBank.held : 0).toString()
  // bank.map((entity) => console.log("b",))

  const betTable = useEntityQuery([Has(BetTable)]);
  // betTable.map((entity) => useComponentValue(BetTable, entity))

  betTable.map((entity) => getComponentValueStrict(BetTable, entity))

  // console.log(`betTable.entries()`, betTable.entries())

  //const counter = useComponentValue(CounterTable, singletonEntity);

  // const houseCandy = 1320000

  // use ethers to convert bankBalance and bankHeld to ether as houseCandy
  // var houseCandy = ethers.utils.formatEther(bankBalance - bankHeld)
  // console.log({ houseCandy })

  const yourCandy = 325
  const [betAmount, setBetAmount] = useState(5)
  const [probability, setProbability] = useState(0.125)
  const [selectedNode, setSelectedNode] = useState({ column: -1, row: -1, probability: 0 })
  let nextBlockIterator
  // shiiiiii  
  window.PACHINGO.setSelectedNode = setSelectedNode



  const onBet = async () => {

    // let balance = await signer.get()?.getBalance()
    // console.log({ balance })
    if (selectedNode.column < 0) return

    const sendTx = await worldSend("sendMoney", [{ value: ethers.utils.parseEther("1.0") }])
    // const sendTx = await worldContract.sendMoney({ value: ethers.utils.parseEther("0.001") })

    console.log({ sendTx })
    await sendTx.wait();
    console.log('testSendMoney done')
    // const bankTx = await worldSend("testBank", []);
    // console.log({ bankTx })
    // await bankTx.wait();
    // console.log('testBank done')

    // const tx = await worldSend("testStartBet", []);
    // console.log({ tx })
    // await tx.wait();
    // console.log('testStartBet done')
    // const tx2 = await worldSend("testEndBet", [])
    // console.log({ tx2 })
    // await tx2.wait();
    // console.log('testEndBet done')

    // let value = ethers.utils.parseEther(betAmount.toString())
    // // make sure contract can make a bet that big

    // // const probability = selectedNode.probability
    // // const payout = Math.floor(betAmount / probability)
    // // console.log({ bank })
    // // if (payout > bank.balance) {
    // //   alert("Not enough candy in the bank to pay out this bet")
    // //   return
    // // }
    // console.log({ selectedNode })
    // const { x, y } = getGraphToDeltaXYCoords(selectedNode.column, selectedNode.row)
    // console.log({ x, y })
    // const tx = await worldSend("makeBet", [x, y, { value }]);
    // console.log({ tx })
    // await tx.wait();
    // console.log('bet made')
    // const tx2 = await worldSend("resolveBet", []);
    // console.log({ tx2 })
    // await tx2.wait();
    // console.log('bet resolved')
  }


  const onViewChange = (newView: any) => {
    setCurrentView(newView)
  }
  // console.log('HAVE BANK', { houseCandy }, { bankBalance }, { bankHeld })

  return (
    <>
      <PixiWrapper selectedNode={selectedNode} />
      <UIWrapper
        currentView={currentView}
        onViewChange={onViewChange}
        houseCandy={houseCandy}
        yourCandy={yourCandy}
        betAmount={betAmount}
        setBetAmount={setBetAmount}
        probability={selectedNode.probability}
        onBet={onBet}
      />
    </>
  );
};

const getGraphToDeltaXYCoords = (column, row) => {
  // column and row are 1-indexed
  let x = column - 1
  let offset = row - column / 2
  let y = -(Math.ceil(Math.abs(offset - 1 / 2)) * Math.sign(offset - 1 / 2))
  return { x, y }
}