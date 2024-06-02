import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { randomRequestParameters } from "../../../utils/raffle";
import { network } from "hardhat";
import { blockChainId } from "../../../utils/utils";

export default buildModule("Raffle", (m) => {
  const args = randomRequestParameters.find(
    (_) => _.blockChainId === blockChainId.localhost
  )!;

  if (network.config.chainId === blockChainId.sepolia) {
    const raffleContract = m.contract("Raffle", [
      +args.subscriptionId,
      args.vrfCoordinator,
      args.keyHash,
      args.callbackGasLimit,
    ]);
    return { raffleContract };
  }

  console.log("Deploy localhost mode ...");
  const raffleContract = m.contract("Raffle", [
    +args.subscriptionId,
    args.vrfCoordinator,
    args.keyHash,
    args.callbackGasLimit,
  ]);
  return { raffleContract };
});
