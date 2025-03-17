import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { CHAINID } from "../../../utils/utils";
import { chainlinkPriceFeed } from "../../../utils/chainlink";

const MockV3AggregatorModule = buildModule("MockV3Aggregator", (m) => {
  const mockDecimals = chainlinkPriceFeed.ETH.USD.filter(
    (_) => _.chainId === CHAINID.HARDHAT
  )[0].decimals;

  const _decimals = m.getParameter("_decimals", mockDecimals);
  const _initialAnswer = m.getParameter("_initialAnswer", 327541000000);
  const mockV3AggregatorContract = m.contract("MockV3Aggregator", [
    _decimals,
    _initialAnswer,
  ]);
  return { mockV3AggregatorContract };
});

export default MockV3AggregatorModule;
