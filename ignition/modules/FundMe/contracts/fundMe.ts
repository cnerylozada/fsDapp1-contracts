import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import MockDataFeed from "./mockDataFeed";

export default buildModule("FundMe", (m) => {
  const { mockDataFeed } = m.useModule(MockDataFeed);
  const _priceFeedAddress = mockDataFeed;
  const fundMe = m.contract("FundMe", [_priceFeedAddress]);
  return { fundMe, mockDataFeed };
});
