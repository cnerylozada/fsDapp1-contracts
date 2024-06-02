import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import MockDataFeed from "./mockDataFeed";
import { network } from "hardhat";
import { localhostChainId } from "../../../utils/utils";
import { chainlinkContractAddresses } from "../../../utils/fundMe";

export default buildModule("FundMe", (m) => {
  const chainId = network.config.chainId!;
  const { mockDataFeed } = m.useModule(MockDataFeed);
  if (chainId === localhostChainId) {
    console.log("deploy FundMe locally....");
    const _priceFeedAddress = mockDataFeed;
    const fundMe = m.contract("FundMe", [_priceFeedAddress]);
    return { fundMe, mockDataFeed };
  }
  const _priceFeedAddress = chainlinkContractAddresses.find((_) => _.chainId)
    ?.ethUsdPriceFeed!;
  const fundMe = m.contract("FundMe", [_priceFeedAddress]);
  return { fundMe, mockDataFeed };
});
