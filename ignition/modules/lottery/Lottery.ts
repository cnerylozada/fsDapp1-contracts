import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const LotteryModule = buildModule("LotteryModule", (m) => {
  const mainDeployer = m.getParameter("mainDeployer", m.getAccount(0));
  const numTickets = m.getParameter("numTickets", 3);
  const ticketPrice = m.getParameter("ticketPrice", parseEther("0.001"));
  const vrfCoordinator = "0x02667f44a6a44E4BDddCF80e724512Ad3426B17d";
  const subscriptionId = BigInt(
    "83697403553201561029298105597157576138702100655624205466322482523261656003262"
  );
  const keyHash =
    "0xc3d5bc4d5600fa71f7a50b9ad841f14f24f9ca4236fd00bdb5fda56b052b28a4";

  const prize = m.getParameter("prize", parseEther("0.00375"));

  const lotteryContract = m.contract(
    "Lottery",
    [
      mainDeployer,
      numTickets,
      ticketPrice,
      vrfCoordinator,
      subscriptionId,
      keyHash,
    ],
    {
      value: prize,
    }
  );
  return { lotteryContract };
});

export default LotteryModule;
