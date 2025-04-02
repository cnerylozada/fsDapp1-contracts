import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";
import {
  chainlinkVRFSubscriptions,
  chainlinkVRFSupportedNetworks,
} from "../../../utils/chainlink";
import { network } from "hardhat";
import VRFCoordinatorMockModule from "./VRFCoordinatorMock";
import { CHAINID } from "../../../utils/utils";

const LotteryModule = buildModule("LotteryModule", (m) => {
  const mainDeployer = m.getParameter("mainDeployer", m.getAccount(0));
  const numTickets = m.getParameter("numTickets", 3);
  const ticketPrice = m.getParameter("ticketPrice", parseEther("0.001"));

  const prize = m.getParameter("prize", parseEther("0.00375"));

  const currentNetwork = network.config.chainId;

  const { VRFCoordinatorV2_5MockContract } = m.useModule(
    VRFCoordinatorMockModule
  );
  if (currentNetwork === CHAINID.HARDHAT) {
    const callCreateSubscription = m.call(
      VRFCoordinatorV2_5MockContract,
      "createSubscription",
      []
    );
    const subscriptionId = m.readEventArgument(
      callCreateSubscription,
      "SubscriptionCreated",
      "subId"
    );
    m.call(VRFCoordinatorV2_5MockContract, "fundSubscription", [
      subscriptionId,
      parseEther("100"),
    ]);

    const lotteryContract = m.contract(
      "Lottery",
      [
        mainDeployer,
        numTickets,
        ticketPrice,
        VRFCoordinatorV2_5MockContract,
        subscriptionId,
        "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
      ],
      {
        value: prize,
      }
    );
    m.call(VRFCoordinatorV2_5MockContract, "addConsumer", [
      subscriptionId,
      lotteryContract,
    ]);
    return { lotteryContract, VRFCoordinatorV2_5MockContract };
  } else {
    const { VRFCoordinator, keyHash } = chainlinkVRFSupportedNetworks.filter(
      (_) => _.chainId === currentNetwork
    )[0];
    const { subscriptionId } = chainlinkVRFSubscriptions.filter(
      (_) => _.chainId === currentNetwork
    )[0];

    const lotteryContract = m.contract(
      "Lottery",
      [
        mainDeployer,
        numTickets,
        ticketPrice,
        VRFCoordinator,
        subscriptionId,
        keyHash,
      ],
      {
        value: prize,
      }
    );

    return { lotteryContract, VRFCoordinatorV2_5MockContract };
  }
});

export default LotteryModule;
