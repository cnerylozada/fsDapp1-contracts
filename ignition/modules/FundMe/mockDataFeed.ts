import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MockDataFeed", (m) => {
  const _decimals = 8;
  const _initialAnswer = 200000000000;
  const mockDataFeed = m.contract("MockV3Aggregator", [
    _decimals,
    _initialAnswer,
  ]);
  return { mockDataFeed };
});
