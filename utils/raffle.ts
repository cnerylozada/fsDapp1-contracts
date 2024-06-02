import { blockChainId } from "./utils";

export const randomRequestParameters = [
  {
    blockChainId: blockChainId.localhost,
    subscriptionId: "1",
    vrfCoordinator: "0x",
    callbackGasLimit: 40000,
    keyHash: "0x",
  },
  {
    blockChainId: blockChainId.sepolia,
    subscriptionId:
      "98781142419196898069637439385605607317145241753854318841858742632836163104000",
    vrfCoordinator: "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B",
    callbackGasLimit: 40000,
    keyHash:
      "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
  },
];
