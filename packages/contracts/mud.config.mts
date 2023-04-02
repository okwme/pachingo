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
        held: "uint256",
      },
      primaryKeys: {}
    },
    BetTable: {
      primaryKeys: {
        block: "uint256",
      },
      schema: {
        deltaX: "uint256",
        deltaY: "int256",
        resolved: "BetStatus",
        wager: "uint256",
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
