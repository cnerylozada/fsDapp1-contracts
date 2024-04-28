import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("FundMe", (m) => {
  const _decimals = 8;
  const _initialAnswer = 200000000000;
  const mockDataFeed = m.contract("MockV3Aggregator", [
    _decimals,
    _initialAnswer,
  ]);
  const _priceFeedAddress = mockDataFeed;
  const fundMe = m.contract("FundMe", [_priceFeedAddress], {
    after: [mockDataFeed],
  });
  return { mockDataFeed, fundMe };
});
