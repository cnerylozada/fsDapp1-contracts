import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { network } from "hardhat";
import { CHAINID } from "../../../utils/utils";
import MockV3AggregatorModule from "./MockV3Aggregator";
import { chainlinkPriceFeed } from "../../../utils/chainlink";

const FundMeModule = buildModule("FundMeModule", (m) => {
  const currentChainId = network.config.chainId;

  const _minAmountInUSD = m.getParameter("_minAmountInUSD", 3);

  const { mockV3AggregatorContract } = m.useModule(MockV3AggregatorModule);

  const dataFeed = chainlinkPriceFeed.ETH.USD.filter(
    (_) => _.chainId === currentChainId
  )[0];

  const account1 = m.getAccount(0);
  const fundMeContract = m.contract("FundMe", [
    account1,
    _minAmountInUSD,
    currentChainId === CHAINID.HARDHAT
      ? mockV3AggregatorContract
      : dataFeed.address,
    dataFeed.decimals,
  ]);

  return { fundMeContract };
});

export default FundMeModule;
