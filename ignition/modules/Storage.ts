import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { network } from "hardhat";
import { CHAINID } from "../../utils";

const StorageModule = buildModule("StorageModule", (m) => {
  let _course = "science";
  const currentNetwork = network.config.chainId;
  if (currentNetwork === CHAINID.SEPOLIA) _course = "science_sepolia";
  if (currentNetwork === CHAINID.OPTIMISMSEPOLIA) _course = "science_opSepolia";

  const storageContract = m.contract("Storage", [_course]);
  return { storageContract };
});

export default StorageModule;
