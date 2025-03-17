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
    chainId: CHAINID.OPTIMISMSEPOLIA,
    vrfCoordinator: `0x02667f44a6a44E4BDddCF80e724512Ad3426B17d`,
    keyHash:
      "0xc3d5bc4d5600fa71f7a50b9ad841f14f24f9ca4236fd00bdb5fda56b052b28a4",
  },
  {
    chainId: CHAINID.ARBITRUMSEPOLIA,
    vrfCoordinator: "0x5CE8D5A2BC84beb22a398CCA51996F7930313D61",
    keyHash:
      "0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be",
  },
  {
    chainId: CHAINID.SEPOLIA,
    vrfCoordinator: `0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B`,
    keyHash:
      "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
  },
];
