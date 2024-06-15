import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { randomRequestParameters } from "../../../utils/contracts/multiRaffle";
import { ethers, network } from "hardhat";
import { blockChainId } from "../../../utils/utils";
import MockVRFCoordinatorV2_5 from "./mockVRFCoordinatorV2_5";

export default buildModule("MultiRaffle", (m) => {
  const args = randomRequestParameters.find(
    (_) => _.blockChainId === blockChainId.localhost
  )!;

  const { mockVRFCoordinatorV2_5Contract } = m.useModule(
    MockVRFCoordinatorV2_5
  );

  if (network.config.chainId === blockChainId.sepolia) {
    const args = randomRequestParameters.find(
      (_) => _.blockChainId === blockChainId.sepolia
    )!;
    const raffleContract = m.contract("MultiRaffle", [
      +args.subscriptionId,
      args.vrfCoordinatorAddress,
      args.keyHash,
      args.callbackGasLimit,
    ]);
    return { raffleContract, mockVRFCoordinatorV2_5Contract };
  }

  console.log("Deploy localhost mode ...");
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
  m.call(mockVRFCoordinatorV2_5Contract, "fundSubscription", [
    subId,
    ethers.parseEther("90"),
  ]);

  const vrfCoordinatorAddress = mockVRFCoordinatorV2_5Contract;
  const raffleContract = m.contract("MultiRaffle", [
    subId,
    vrfCoordinatorAddress,
    args.keyHash,
    args.callbackGasLimit,
  ]);

  m.call(mockVRFCoordinatorV2_5Contract, "addConsumer", [
    subId,
    raffleContract,
  ]);
  return { raffleContract, mockVRFCoordinatorV2_5Contract };
});
