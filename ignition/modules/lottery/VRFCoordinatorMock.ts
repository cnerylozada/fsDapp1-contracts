import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const VRFCoordinatorMockModule = buildModule(
  "VRFCoordinatorMockModule",
  (m) => {
    const baseFee = parseEther("0.1");
    const gasPriceLINK = 1000000000;
    const weiPerUnitLINK = parseEther("0.0072985");

    const VRFCoordinatorV2_5MockContract = m.contract(
      "VRFCoordinatorV2_5Mock",
      [baseFee, gasPriceLINK, weiPerUnitLINK]
    );

    return { VRFCoordinatorV2_5MockContract };
  }
);

export default VRFCoordinatorMockModule;
