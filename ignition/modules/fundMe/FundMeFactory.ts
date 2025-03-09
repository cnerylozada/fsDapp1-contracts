import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FundMeFactorModule = buildModule("FundMeFactorModule", (m) => {
  const fundMeFactoryContract = m.contract("FundMeFactory", []);
  return { fundMeFactoryContract };
});

export default FundMeFactorModule;
