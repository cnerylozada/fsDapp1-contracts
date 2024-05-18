import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import MockDataFeed from "./mockDataFeed";
import { network } from "hardhat";
import { localhostChainId } from "../../../utils/utils";
import { contractAddresses } from "../../../utils/chainlink";

export default buildModule("FundMe", (m) => {
  const chainId = network.config.chainId!;
  const { mockDataFeed } = m.useModule(MockDataFeed);
  if (chainId === localhostChainId) {
    const _priceFeedAddress = mockDataFeed;
    const fundMe = m.contract("FundMe", [_priceFeedAddress]);
    return { fundMe, mockDataFeed };
  }
  const _priceFeedAddress = contractAddresses.find((_) => _.chainId)
    ?.ethUsdPriceFeed!;
  const fundMe = m.contract("FundMe", [_priceFeedAddress]);
  return { fundMe, mockDataFeed };
});
