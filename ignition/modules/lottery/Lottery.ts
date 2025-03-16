import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const LotteryModule = buildModule("LotteryModule", (m) => {
  const mainDeployer = m.getParameter("mainDeployer", m.getAccount(0));
  const numTickets = m.getParameter("numTickets", 3);
  const ticketPrice = m.getParameter("ticketPrice", parseEther("0.001"));

  const prize = m.getParameter("prize", parseEther("0.00375"));

  const lotteryContract = m.contract(
    "Lottery",
    [mainDeployer, numTickets, ticketPrice],
    {
      value: prize,
    }
  );
  return { lotteryContract };
});

export default LotteryModule;
