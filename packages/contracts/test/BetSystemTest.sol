// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";

import { MudV2Test } from "@latticexyz/std-contracts/src/test/MudV2Test.t.sol";
// import { getKeysWithValue } from "@latticexyz/world/src/modules/keyswithvalue/getKeysWithValue.sol";

import { IWorld } from "../src/world/IWorld.sol";
import { OpenBet } from "../src/tables/OpenBet.sol";

import { BetTableData, BetTable } from "../src/tables/BetTable.sol";

// import { SingletonKey } from "../src/systems/IncrementSystem.sol";

contract BetTest is MudV2Test {
  IWorld world;

  function setUp() public override {
    super.setUp();
    world = IWorld(worldAddress);
  }

  function testWorldExists() public {
    uint256 codeSize;
    address addr = worldAddress;
    assembly {
      codeSize := extcodesize(addr)
    }
    assertTrue(codeSize > 0);
  }

  function testSend() public {
    address alice = makeAddr("alice");
    startHoax(alice, 1 ether);
    world.sendMoney{ value: 1 ether }();
    uint256 balance = address(world).balance;
    assertEq(balance, 1 ether);
  }

  function testCalculateResults() public {
    bool[5] memory wentUp;
    int256 accumulativeDelta;
    (wentUp, accumulativeDelta) = world.calculateResults(block.number - 1, 1, 1);
    console.log(wentUp[0]);
    // console.log(accumulativeDelta);
  }

  function testHappyPath() public {
    address alice = makeAddr("alice");
    startHoax(alice, 10 ether);

    world.sendMoney{ value: 5 ether }();

    assertEq(address(world).balance, 5 ether);

    world.makeBet{ value: 1 ether }(1, 1);
    uint256 openBet = OpenBet.get(world);
    vm.roll(openBet + 1);
    assertEq(openBet, block.number - 1);

    world.resolveBet();
    BetTableData memory bet = BetTable.get(world, openBet);

    // assertEq(bet.wentUp[0], true);
  }

  //   // Expect the counter to be 1 because it was incremented in the PostDeploy script.
  //   bytes32 key = SingletonKey;
  //   uint32 counter = CounterTable.get(world, key);
  //   assertEq(counter, 1);

  //   // Expect the counter to be 2 after calling increment.
  //   world.increment();
  //   counter = CounterTable.get(world, key);
  //   assertEq(counter, 2);
  // }

  // function testKeysWithValue() public {
  //   bytes32 key = SingletonKey;
  //   uint32 counter = CounterTable.get(world, key);
  //   bytes32[] memory keysWithValue = getKeysWithValue(world, CounterTableTableId, CounterTable.encode(counter));
  //   assertEq(keysWithValue.length, 1);
  // }
}
