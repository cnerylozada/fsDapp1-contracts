import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const FundMeModule = buildModule("FundMeModule", (m) => {
  const _minAmountInUSD = m.getParameter("_minAmountInUSD", 3);
  const fundMeContract = m.contract("FundMe", [_minAmountInUSD]);

  return { fundMeContract };
});

export default FundMeModule;
