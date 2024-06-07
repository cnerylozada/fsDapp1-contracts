import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";

export default buildModule("VRFCoordinatorV2_5Mock", (m) => {
  const baseFee = ethers.parseEther("0.1");
  const gasPrice = 1000000000;
  const weiPerUnitLink = 4647038133635714;

  const mockVRFCoordinatorV2_5Contract = m.contract("VRFCoordinatorV2_5Mock", [
    baseFee,
    gasPrice,
    weiPerUnitLink,
  ]);

  return { mockVRFCoordinatorV2_5Contract };
});
