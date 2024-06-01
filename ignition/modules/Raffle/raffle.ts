import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Raffle", (m) => {
  const raffleContract = m.contract("Raffle");
  return { raffleContract };
});
