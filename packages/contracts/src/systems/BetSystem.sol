// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { console } from "forge-std/console.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { BetTable, BetTableData } from "../tables/BetTable.sol";
import { OpenBet } from "../tables/OpenBet.sol";
import { Bank, BankData } from "../tables/Bank.sol";
import { BetStatus } from "../Types.sol";

contract BetSystem is System {
  uint constant oddsDivisor = 100_000;
  uint256 constant MAX_BLOCKS_TIL_BET_IS_INVALID = 256; // 64 minutes

  // function testBank() public {
  //   BankData memory bankData = Bank.get();
  //   Bank.set(bankData.balance + 10_000_000_000_000_000_000, bankData.escrow + 1_000_000_000_000_000_000);
  // }

  // function testStartBet() public {
  //   OpenBet.set(block.number);
  //   BetTable.set(
  //     msg.sender,
  //     uint256(block.number),
  //     1,
  //     2,
  //     BetStatus.UNRESOLVED,
  //     1_000_000_000_000_000,
  //     1_000_000_000_000_000,
  //     12500,
  //     [false, false, false, false, false]
  //   );
  // }

  // function testEndBet() public {
  //   uint256 lastOpenBet = OpenBet.get();
  //   BetTableData memory bet = BetTable.get(lastOpenBet);
  //   bet.resolution = BetStatus.WON;
  //   bet.wentUp = [true, false, true, false, true];
  //   BetTable.set(lastOpenBet, bet);
  //   OpenBet.set(0);
  // }

  function sendMoney() public payable {
    BankData memory bankData = Bank.get();
    Bank.set(address(_world()).balance, bankData.escrow);
  }

  // makeBet accepts a bet in the form of deltaX (how many steps into the future is the bet)
  // and deltaY (how many steps up or down is the bet)
  // each step there is a 50/50 chance of going up or down
  // before the current bet can proceed, the previous one has to be cleared so that
  // losing bet's funds aren't held in escrow too long.
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
    Bank.set(address(_world()).balance, payout);

    bool[5] memory wentUp = [false, false, false, false, true];
    BetTable.set(
      uint256(block.number),
      _msgSender(),
      deltaX,
      deltaY,
      0, // unknown result
      BetStatus.UNRESOLVED,
      msg.value,
      payout,
      odds,
      wentUp
    );
    OpenBet.set(block.number);
  }

  function resolveBet() public returns (bool) {
    uint256 openBet = OpenBet.get();
    require(openBet != 0, "There is no open bet");
    // Get the bet from the BetTable
    BetTableData memory bet = BetTable.get(openBet);

    // make sure 1 block has passed since the bet was made
    require(openBet + 1 <= block.number, "Bet is not ready to be resolved yet");

    if (openBet + MAX_BLOCKS_TIL_BET_IS_INVALID < block.number) {
      // too much time has passed to collect your winnings
      // bet is considered invalid because we can't grab the source
      // of randomness from bet block + 1
      closeBet(openBet, BetStatus.LOST, bet);
      return true;
    }

    int256 accumulativeDeltaY;
    bool[5] memory wentUp;
    (wentUp, accumulativeDeltaY) = calculateResults(openBet, bet.deltaX, bet.deltaY);
    bet.wentUp = wentUp;
    bet.result = accumulativeDeltaY;
    if (accumulativeDeltaY == bet.deltaY) {
      closeBet(openBet, BetStatus.WON, bet);
    } else {
      closeBet(openBet, BetStatus.LOST, bet);
    }
    return true;
  }

  function closeBet(uint256 openBet, BetStatus resolution, BetTableData memory bet) internal {
    require(resolution != BetStatus.UNRESOLVED, "can't close an unresolved bet");

    bet.resolution = resolution;
    uint256 payout = getPayout(bet.wager, bet.odds);

    // if the player sets an address that can't receive the payment they resolution is changed to LOST
    if (!settleAccount(bet)) {
      //payout, resolution, bet.player)) {
      settleAccount(bet); //payout, BetStatus.LOST, bet.player);
    }
    // bet.wentUp = [true, true, true, true, true];
    BetTable.set(openBet, bet);
    OpenBet.set(0);
  }

  function settleAccount(BetTableData memory bet) internal returns (bool) {
    bool success = true;

    if (bet.resolution == BetStatus.WON) {
      // payout the bet
      (success, ) = payable(bet.player).call{ value: bet.payout + bet.wager }("");
      // require(success, "couldn't pay the winner");
    }

    BankData memory bankData = Bank.get();
    bankData.escrow -= bet.payout;
    Bank.set(address(_world()).balance, bankData.escrow);

    return success;
  }

  function calculateResults(
    uint256 openBet,
    uint256 deltaX,
    int256 deltaY
  ) public view returns (bool[5] memory wentUp, int256 accumulativeDeltaY) {
    require(openBet < block.number, "openBet must be less than current block.number");
    accumulativeDeltaY = 0;
    for (uint256 i = 0; i < deltaX; i++) {
      // could be more gas efficient
      // should also eventually be upgraded to randDAO or something else that a miner can't manipulate
      uint256 minerCanManipulateRandom = uint256(
        keccak256(
          abi.encodePacked(
            i,
            blockhash(openBet + 1) //, // only needs to be +1 block from time bet was made to resolve the bet
            // block.number,
            // block.gaslimit,
            // block.timestamp
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
    BankData memory bankData;
    uint256 moneyCurrentlyInEscrowForOpenBets;
    bankData = Bank.get();
    moneyCurrentlyInEscrowForOpenBets = bankData.escrow;

    return address(_world()).balance - moneyCurrentlyInEscrowForOpenBets;
  }

  function bankHasEnoughFundsForBet(uint256 deltaX, int256 deltaY, uint256 wager) public view returns (bool) {
    uint256 odds = getOdds(deltaX, deltaY);
    uint256 payout = getPayout(wager, odds);
    return (payout <= getBank());
  }

  function getPayout(uint256 wager, uint256 odds) public pure returns (uint256) {
    return (((wager * oddsDivisor) / odds) - wager);
  }

  function getOdds(uint256 deltaX, int256 deltaY) public pure returns (uint256) {
    if (deltaX == 1) {
      require(abs(deltaY) == 1, "Invalid deltaY 1");
      return 50000; // 0.50000
    } else if (deltaX == 2) {
      if (abs(deltaY) == 2) {
        return 25000; // 0.25000
      } else if (deltaY == 0) {
        return 50000; // 0.50000
      } else {
        revert("Invalid deltaY #2");
      }
    } else if (deltaX == 3) {
      if (abs(deltaY) == 3) {
        return 25000; // 0.25000
      } else if (abs(deltaY) == 1) {
        return 12500; // 0.12500
      } else {
        revert("Invalid deltaY #3");
      }
    } else if (deltaX == 4) {
      if (abs(deltaY) == 4) {
        return 6250; // 0.06250
      } else if (abs(deltaY) == 2) {
        return 25000; // 0.25000
      } else if (deltaY == 0) {
        return 37500; // 0.37500
      } else {
        revert("Invalid deltaY #4");
      }
    } else if (deltaX == 5) {
      if (abs(deltaY) == 5) {
        return 3125; // 0.03125
      } else if (abs(deltaY) == 3) {
        return 12625; // 0.12625
      } else if (abs(deltaY) == 1) {
        // (abs(deltaY) == 1) {
        return 3125; // 0.03125
      } else {
        revert("Invalid deltaY #5");
      }
    } else {
      revert("Invalid deltaX");
    }
  }

  function abs(int x) private pure returns (int) {
    return x >= 0 ? x : -x;
  }
}
