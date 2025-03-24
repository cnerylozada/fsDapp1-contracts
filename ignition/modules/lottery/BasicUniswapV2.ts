import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { network } from "hardhat";
import { WETHAddresses } from "../../../utils/uniswap";
import { chainlinkVRFSupportedNetworks } from "../../../utils/chainlink";

const BasicUniSwapV2Module = buildModule("BasicUniSwapV2Module", (m) => {
  const currentNetwork = network.config.chainId;

  const { address } = WETHAddresses.filter(
    (_) => _.chainId === currentNetwork
  )[0];
  const { LINKToken } = chainlinkVRFSupportedNetworks.filter(
    (_) => _.chainId === currentNetwork
  )[0];
  const BasicUniSwapV2Contract = m.contract("BasicUniswapV2", [
    address,
    LINKToken,
  ]);

  return { BasicUniSwapV2Contract };
});

export default BasicUniSwapV2Module;
