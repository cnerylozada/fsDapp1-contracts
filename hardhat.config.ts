import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

const ALCHEMY_SEPOLIA_APIKEY = process.env.ALCHEMY_SEPOLIA_APIKEY;
const SEPOLIA_PRIVATEKEY = process.env.SEPOLIA_PRIVATEKEY!;
const COINMARKET_API_KEY = process.env.COINMARKET_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: `http://127.0.0.1:8545/`,
      chainId: 31337,
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_APIKEY}`,
      accounts: [SEPOLIA_PRIVATEKEY],
      chainId: 11155111,
    },
  },
  // ignition: {
  //   requiredConfirmations: 3,
  // },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
