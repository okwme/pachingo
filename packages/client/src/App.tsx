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
let pollBalance
export const App = () => {
  const [initialized, setInitialized] = useState(false)
  const [currentView, setCurrentView] = useState(INTERFACE_STATE.NOW)
  const {
    components: { Bank, BetTable, OpenBet },
    // singletonEntity,
    network: { signer, blockNumber },
    worldSend,
    networkConfig,
    worldContract
  } = useMUD();

  const [userBalance, setUserBalance] = useState("0")

  useEffect(() => {
    pollBalance = setInterval(async () => {
      const userBalanceBN = await signer.get()?.getBalance()
      setUserBalance(ethers.utils.formatEther(userBalanceBN))
    }, 1000)
    return () => {
      clearInterval(pollBalance)
    }
  })

  // // TODO (cezar): Currently adding mock state variables here. They will eventually come from MUD
  // Bank.update$.subscribe((_bank) => {
  //   setBankBalance(_bank.value[0]?.balance || 0)
  //   setBankEscrow(_bank.value[0]?.escrow || 0)

  //   var currentValue = _bank.value[0]
  //   var previousValue = _bank.value[1]
  //   console.log(`_bank updated`, currentValue, previousValue)
  //   console.log({ _bank })
  //   console.log({ bank })
  //   console.log({ bankBalance, bankEscrow })
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

  const openBet = useEntityQuery([Has(OpenBet)])[0]
  const maybeOpenBet = useComponentValue(OpenBet, openBet)

  const bank = useEntityQuery([Has(Bank)])[0];
  const maybeBank = useComponentValue(Bank, bank)
  const houseCandy = (maybeBank ? maybeBank.balance - maybeBank.escrow : 0).toString()

  const bankBalance = maybeBank ? ethers.utils.formatEther(maybeBank.balance) : "0"
  const bankEscrow = maybeBank ? ethers.utils.formatEther(maybeBank.escrow) : "0"

  const betTable = useEntityQuery([Has(BetTable)]);
  // keep this (vvvv) commented out but for reference of how to do it another way
  // betTable.map((entity) => useComponentValue(BetTable, entity))
  const allBets = betTable.map((entity) => getComponentValueStrict(BetTable, entity))




  const yourCandy = 325
  const [betAmount, setBetAmount] = useState(5)
  const [probability, setProbability] = useState(0.125)
  const [selectedNode, setSelectedNode] = useState({ column: -1, row: -1, probability: 0 })
  let nextBlockIterator
  // shiiiiii  
  window.PACHINGO.setSelectedNode = setSelectedNode

  // initialize the world so that it has money and that money is registered in the bank table
  const initializeWorld = async () => {
    if (initialized) return
    setInitialized(true)
    try {
      let worldBalance = await worldContract.provider.getBalance(networkConfig.worldAddress)
      // const getBank = await worldContract.getBank()
      const howMuchShouldWorldStartWith = "5"
      const howMuchShouldWorldStartWithWei = ethers.utils.parseEther(howMuchShouldWorldStartWith)
      if (worldBalance.lt(howMuchShouldWorldStartWithWei)) {
        let userBalance = await signer.get()?.getBalance()
        if (userBalance?.lt(howMuchShouldWorldStartWithWei)) {
          alert("UH OHHH not enough money to send to world contract")
          setInitialized(false)
        } else {
          console.log(`---Depositing ${howMuchShouldWorldStartWith} into Bank`)
          const sendTx = await worldSend("sendMoney", [{ value: howMuchShouldWorldStartWithWei }])
          await sendTx.wait();
          console.log('---Successfully deposited ')
        }
      }
    } catch (error) {
      console.error({ error })
      setInitialized(false)
    }
  }

  const onBet = async () => {
    // can't bet on first node
    if (selectedNode.column < 0) return

    let balance = await signer.get()?.getBalance()
    let betAmountInWei = ethers.utils.parseEther(betAmount.toString())

    // make sure player has enough money
    // TODO: make sure this is being done with form validation instead
    if (balance?.lt(betAmountInWei)) {
      alert("Not enough money to make this bet")
      return
    }

    const probability = selectedNode.probability

    // make sure contract can make a bet that big
    // TODO: make sure this is being done with form validation instead
    const locallyCalculatedPayout = (((betAmount) / probability) - betAmount)
    let payoutInWei = ethers.utils.parseEther(locallyCalculatedPayout.toString())

    if (payoutInWei.gt(ethers.utils.parseEther(bankBalance))) {
      alert("Not enough candy in the bank to pay out this bet")
      return
    }

    const { x, y } = getGraphToDeltaXYCoords(selectedNode.column, selectedNode.row)

    console.log(`---making bet`)
    console.log(`---deltaX = ${x} and deltaY = ${y}`)
    console.log(`---wager = ${betAmount} Candies`)
    console.log(`---odds = ${probability}`)
    console.log(`---payout of ${locallyCalculatedPayout.toString()} Candies`)

    const tx = await worldSend("makeBet", [x, y, { value: betAmountInWei }]);
    await tx.wait();
    console.log('---bet made')

    const tx2 = await worldSend("resolveBet", []);
    await tx2.wait();
    console.log('---bet resolved')
  }

  const onViewChange = (newView: any) => {
    setCurrentView(newView)
  }

  return (
    <>
      <PixiWrapper selectedNode={selectedNode} allBets={allBets} />
      <UIWrapper
        currentView={currentView}
        onViewChange={onViewChange}
        houseCandy={houseCandy}
        yourCandy={yourCandy}
        betAmount={betAmount}
        setBetAmount={setBetAmount}
        probability={selectedNode.probability}
        onBet={onBet}
        betDisabled={selectedNode.column < 0}
      />
      {!initialized || !bankBalance && <div style={{ zIndex: "999", position: "fixed", top: 0, left: 0 }} onClick={initializeWorld}>initializeWorld</div>}
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