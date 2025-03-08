import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import dotenv from "dotenv";
import { CHAINID } from "./utils";
dotenv.config();

const ALCHEMY_ETHEREUM_SEPOLIA = process.env.ALCHEMY_ETHEREUM_SEPOLIA!;
const ALCHEMY_OPTIMISM_SEPOLIA = process.env.ALCHEMY_OPTIMISM_SEPOLIA!;
const ALCHEMY_ARBITRUM_SEPOLIA = process.env.ALCHEMY_ARBITRUM_SEPOLIA!;

const MAIN_DEPLOYER_PRIVATE_KEY = process.env.MAIN_DEPLOYER_PRIVATE_KEY!;

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY!;
const OPTIMISM_ETHERSCAN_API_KEY = process.env.OPTIMISM_ETHERSCAN_API_KEY!;
const ARBITRUM_ETHERSCAN_API_KEY = process.env.ARBITRUM_ETHERSCAN_API_KEY!;

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: CHAINID.HARDHAT,
    },
    sepolia: {
      url: ALCHEMY_ETHEREUM_SEPOLIA,
      accounts: [MAIN_DEPLOYER_PRIVATE_KEY],
      chainId: CHAINID.SEPOLIA,
    },
    opSepolia: {
      url: ALCHEMY_OPTIMISM_SEPOLIA,
      accounts: [MAIN_DEPLOYER_PRIVATE_KEY],
      chainId: CHAINID.OPTIMISMSEPOLIA,
    },
    arbitrumSepolia: {
      url: ALCHEMY_ARBITRUM_SEPOLIA,
      accounts: [MAIN_DEPLOYER_PRIVATE_KEY],
      chainId: CHAINID.ARBITRUMSEPOLIA,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      opSepolia: OPTIMISM_ETHERSCAN_API_KEY,
      arbitrumSepolia: ARBITRUM_ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "opSepolia",
        chainId: CHAINID.OPTIMISMSEPOLIA,
        urls: {
          apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
          browserURL: "https://sepolia-optimism.etherscan.io",
        },
      },
      {
        network: "arbitrumSepolia",
        chainId: CHAINID.ARBITRUMSEPOLIA,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io",
        },
      },
    ],
  },
};

export default config;
