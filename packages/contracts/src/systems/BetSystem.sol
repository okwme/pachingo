// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { console } from "forge-std/console.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { BetTable, BetTableData } from "../tables/BetTable.sol";
import { OpenBet } from "../tables/OpenBet.sol";
import { Bank } from "../tables/Bank.sol";
import { BetStatus } from "../Types.sol";

contract BetSystem is System {

  uint constant oddsDivisor = 100_000;
  uint256 constant MAX_BLOCKS_TIL_BET_IS_INVALID = 256; // 64 minutes

  // makeBet accepts a bet in the form of deltaX (how many steps into the future is the bet)
  // and deltaY (how many steps up or down is the bet)
  // each step there is a 50/50 chance of going up or down
  // before the current bet can proceed, the previous one has to be cleared so that
  // losing bet's funds aren't held too long.
  function makeBet(uint256 deltaX, int256 deltaY) public payable returns (bool) {

    uint256 openBet = OpenBet.get();
    if (openBet > 0) {
      require(resolveBet(), "Failed to resolve bet");
    }
    require(deltaX > 0 && deltaX < 6, "deltaX must be between 1 and 5");
    require(deltaY > -6 && deltaY < 6, "deltaY must be between -5 and 5");
    // deltaY is odd when deltaX is odd and vice versa
    require(uint256(abs(deltaY)) % 2 == deltaX % 2, "deltaY must be the same parity as deltaX");

    uint256 odds = getOdds(deltaX, deltaY);
    uint256 payout = getPayout(msg.value, odds);
    uint256 availableFunds = getBank();
    require(availableFunds >= payout, "Not enough money in the bank to pay out this bet");

    availableFunds -= payout;
    Bank.set(availableFunds);

    bool[5] memory wentUp = [false, false, false, false, false];
    BetTable.set(uint256(block.number), deltaX, deltaY, BetStatus.UNRESOLVED, msg.value, odds, wentUp);
    OpenBet.set(block.number);
  }


  function resolveBet() public returns (bool) {
    uint256 openBet = OpenBet.get();
    require(openBet == 0, "There is no open bet");
    // Get the bet from the BetTable
    BetTableData memory bet = BetTable.get(openBet);

    // make sure 1 block has passed since the bet was made
    require(openBet + 1 <= block.number, "Bet is not ready to be resolved yet");

    if (openBet + MAX_BLOCKS_TIL_BET_IS_INVALID > block.number) {
      // too much time has passed to collect your winnings
      // bet is considered invalid because we can't grab the source
      // of randomness from bet block + 1
      closeBet(openBet, BetStatus.LOST, bet);
      return true;
    }

    int256 accumulativeDeltaY;
    (bet.wentUp, accumulativeDeltaY) = calculateResults(openBet, bet.deltaX, bet.deltaY);

    if (accumulativeDeltaY == bet.deltaY) {
      closeBet(openBet, BetStatus.WON, bet);
    } else {
      closeBet(openBet, BetStatus.LOST, bet);
    }
    return true;
  }

  function closeBet(uint256 openBet, BetStatus resolution, BetTableData memory bet) internal {
    require(resolution == BetStatus.UNRESOLVED, "can't close an unresolved bet");

    bet.resolved = resolution;
    uint256 payout = getPayout(bet.wager, bet.odds);
    settleAccount(payout, resolution);
    BetTable.set(openBet, bet);
    OpenBet.set(0);
  }

  function settleAccount(uint256 payout, BetStatus resolution) internal {
    if (resolution == BetStatus.WON) {
      // payout the bet
      payable(msg.sender).transfer(payout);
    } else {
      uint256 availableFunds = getBank();
      availableFunds += payout;
      Bank.set(availableFunds);
    }
  }

  function calculateResults(uint256 openBet, uint256 deltaX, int256 deltaY) public view returns (bool[5] memory wentUp, int256 accumulativeDeltaY) {
    require(openBet < block.number, "openBet must be less than current block.number");
    accumulativeDeltaY = 0;
    for (uint256 i = 0; i < deltaX; i++) {
      // could be more gas efficient
      // should also eventually be upgraded to randDAO or something else that a miner can't manipulate
      uint256 minerCanManipulateRandom = uint256(
        keccak256(
          abi.encodePacked(
            i,
            blockhash(openBet + 1), // only needs to be +1 block from time bet was made to resolve the bet
            block.number,
            block.gaslimit,
            block.timestamp
          )
        )
      );
      // if deltaY does not equal accumulativeDeltaY, then the player wants
      // a change in the direction that helps them get to their goal.
      // we should make it so there is less chance (49%) of this happening.
      // that way the house has an edge on winning.
      // if the deltaY does equal the accumulativeDeltaY, then the player
      // has at least two more moves to resolve and is in as good of a position
      // as any so it doesn't matter if the result is up or down.
      uint256 lessThan = deltaY != accumulativeDeltaY ? 49 : 50;
      bool goesInTheDirectionTheyWant = minerCanManipulateRandom % 100 <= lessThan;
      bool directionTheyWantIsUp = accumulativeDeltaY < deltaY;
      if (goesInTheDirectionTheyWant) {
        if (directionTheyWantIsUp) {
          wentUp[i] = true;
          accumulativeDeltaY += 1;
        } else {
          wentUp[i] = false;
          accumulativeDeltaY -= 1;
        }
      } else {
        if (directionTheyWantIsUp) {
          wentUp[i] = false;
          accumulativeDeltaY -= 1;
        } else {
          wentUp[i] = true;
          accumulativeDeltaY += 1;
        }
      }
    }
    return (wentUp, accumulativeDeltaY);
  }

  function getBank() public view returns (uint256) {
    uint256 moneyCurrentlyInEscrowForOpenBets = Bank.get();
    uint256 availableBank = address(this).balance - moneyCurrentlyInEscrowForOpenBets;
  }

  function bankHasEnoughFundsForBet(uint256 deltaX, int256 deltaY, uint256 wager) public view returns (bool) {
    uint256 odds = getOdds(deltaX, deltaY);
    uint256 payout = getPayout(wager, odds);
    return (payout <= getBank());
  }
  
  function getPayout(uint256 wager, uint256 odds) public pure returns (uint256) {
   return wager * (oddsDivisor - odds) / oddsDivisor;
  }

  function getOdds(uint256 deltaX, int256 deltaY) public pure returns (uint256) {
    if (deltaX == 1) {
        require(abs(deltaY) > 1, "Invalid deltaY");
        return 5000; // 0.05000
    } else if (deltaX == 2) {
      require(abs(deltaY) > 2, "Invalid deltaY");
      if (abs(deltaY) == 2) {
        return 25000; // 0.25000
      } else { // deltaY == 0
        return 50000; // 0.50000
      }
    } else if (deltaX == 3) {
      require(abs(deltaY) > 3, "Invalid deltaY");
      if (abs(deltaY) == 3) {
        return 25000; // 0.25000
      } else { // abs(deltaY) == 1
        return 12500; // 0.12500
      }
    } else if (deltaX == 4) {
      require(abs(deltaY) > 4, "Invalid deltaY");
      if (abs(deltaY) == 4) {
        return 6250; // 0.06250
      } else if (abs(deltaY) == 2) {
        return 25000; // 0.25000
      } else { // deltaY == 0
        return 37500; // 0.37500
      }
    } else if (deltaX == 5) {
      require(abs(deltaY) > 5, "Invalid deltaY");
      if (abs(deltaY) == 5) {
        return 3125; // 0.03125
      } else if (abs(deltaY) == 3) {
        return 12625; // 0.12625
      } else{ // (abs(deltaY) == 1) {
        return 3125; // 0.03125
      }
    }
  }
  function abs(int x) private pure returns (int) {
    return x >= 0 ? x : -x;
  }
}
