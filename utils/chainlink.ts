import { CHAINID } from "./utils";

export const chainlinkPriceFeed = {
  ETH: {
    USD: [
      {
        chainId: CHAINID.HARDHAT,
        address: `0x`,
        decimals: 8,
      },
      {
        chainId: CHAINID.OPTIMISMSEPOLIA,
        address: `0x61Ec26aA57019C486B10502285c5A3D4A4750AD7`,
        decimals: 8,
      },
      {
        chainId: CHAINID.ARBITRUMSEPOLIA,
        address: "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165",
        decimals: 8,
      },
      {
        chainId: CHAINID.SEPOLIA,
        address: `0x694AA1769357215DE4FAC081bf1f309aDC325306`,
        decimals: 8,
      },
    ],
  },
};

export const chainlinkVRFSupportedNetworks = [
  {
    chainId: CHAINID.SEPOLIA,
    VRFCoordinator: `0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B`,
    keyHash:
      "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    LINKToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
  },
];

export const chainlinkVRFSubscriptions = [
  {
    chainId: CHAINID.SEPOLIA,
    subscriptionId:
      "38066802737348792814143693604228425629159931338435451564623514457891355632766",
  },
];
