import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const LotteryModule = buildModule("LotteryModule", (m) => {
  const _mainDeployer = m.getAccount(0);
  const _numTickets = 3;
  const _ticketPrice = parseEther("0.001");

  const _prize = parseEther("0.00375");

  const lotteryContract = m.contract(
    "Lottery",
    [_mainDeployer, _numTickets, _ticketPrice],
    {
      value: _prize,
    }
  );
  return { lotteryContract };
});

export default LotteryModule;
