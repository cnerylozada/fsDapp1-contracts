import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { randomRequestParameters } from "../../../utils/contracts/raffle";
import { network } from "hardhat";
import { blockChainId } from "../../../utils/utils";
import MockVRFCoordinatorV2_5 from "./mockVRFCoordinatorV2_5";

export default buildModule("Raffle", (m) => {
  const args = randomRequestParameters.find(
    (_) => _.blockChainId === blockChainId.localhost
  )!;

  if (network.config.chainId === blockChainId.sepolia) {
    const args = randomRequestParameters.find(
      (_) => _.blockChainId === blockChainId.sepolia
    )!;
    const raffleContract = m.contract("Raffle", [
      +args.subscriptionId,
      args.vrfCoordinatorAddress,
      args.keyHash,
      args.callbackGasLimit,
    ]);
    return { raffleContract };
  }

  console.log("Deploy localhost mode ...");
  const { mockVRFCoordinatorV2_5Contract } = m.useModule(
    MockVRFCoordinatorV2_5
  );
  const createSubscription = m.call(
    mockVRFCoordinatorV2_5Contract,
    "createSubscription",
    []
  );
  const subId = m.readEventArgument(
    createSubscription,
    "SubscriptionCreated",
    "subId"
  );
  const vrfCoordinatorAddress = mockVRFCoordinatorV2_5Contract;
  const raffleContract = m.contract("Raffle", [
    subId,
    vrfCoordinatorAddress,
    args.keyHash,
    args.callbackGasLimit,
  ]);

  m.call(mockVRFCoordinatorV2_5Contract, "addConsumer", [
    subId,
    raffleContract,
  ]);
  return { raffleContract };
});
