import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { network } from "hardhat";
import { CHAINID, chainlinkPriceFeed } from "../../utils";

const FundMeModule = buildModule("FundMeModule", (m) => {
  let priceFeedAddress = "";
  const currentNetwork = network.config.chainId;
  if (!!currentNetwork)
    priceFeedAddress =
      chainlinkPriceFeed.ETH.USD[currentNetwork as CHAINID].address;

  const _minAmountInUSD = m.getParameter("_minAmountInUSD", 3);
  const _priceFeedAddress = m.getParameter(
    "_priceFeedAddress",
    priceFeedAddress
  );
  const fundMeContract = m.contract("FundMe", [
    _minAmountInUSD,
    _priceFeedAddress,
  ]);

  return { fundMeContract };
});

export default FundMeModule;
