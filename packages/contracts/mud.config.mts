import { mudConfig, resolveTableId } from "@latticexyz/cli";

export default mudConfig({
  overrideSystems: {
    BetSystem: {
      fileSelector: "betSystem",
      openAccess: true,
    },
  },
  enums: {
    BetStatus: ["UNRESOLVED", "WON", "LOST"],
  },
  tables: {
    OpenBet: {
      schema: {
        open: "uint256",
      },
      primaryKeys: {}
    },
    Bank: {
      schema: {
        balance: "uint256",
        escrow: "uint256",
      },
      primaryKeys: {}
    },
    BetTable: {
      primaryKeys: {
        block: "uint256",
      },
      schema: {
        player: "address",
        deltaX: "uint256",
        deltaY: "int256",
        result: "int256",
        resolution: "BetStatus",
        wager: "uint256",
        payout: "uint256",
        odds: "uint256", // this could be calculated from deltaX and deltaY
        wentUp: "bool[5]", // should be changed if we allow more than 5 steps
      },
    },
  },
  modules: [
    {
      name: "KeysWithValueModule",
      root: true,
      args: [resolveTableId("BetTable")],
    },
  ],
});
