import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { network } from "hardhat";
import { CHAINID } from "../../utils/utils";

const StorageModule = buildModule("StorageModule", (m) => {
  const currentNetwork = network.config.chainId;
  let courseName = "default_course";
  if (currentNetwork === CHAINID.SEPOLIA) courseName = "science_sepolia";
  if (currentNetwork === CHAINID.OPTIMISMSEPOLIA)
    courseName = "science_opSepolia";

  const _course = m.getParameter("_course", courseName);
  const storageContract = m.contract("Storage", [_course]);
  return { storageContract };
});

export default StorageModule;
