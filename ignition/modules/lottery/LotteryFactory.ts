import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LotteryFactoryModule = buildModule("LotteryFactoryModule", (m) => {
  const lotteryFactoryContract = m.contract("LotteryFactory", []);

  return { lotteryFactoryContract };
});

export default LotteryFactoryModule;
