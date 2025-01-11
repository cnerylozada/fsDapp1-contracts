export enum CHAINID {
  OPTIMISMSEPOLIA = 11155420,
  SEPOLIA = 11155111,
}

export const chainlinkPriceFeed = {
  ETH: {
    USD: {
      [CHAINID.OPTIMISMSEPOLIA]: {
        address: `0x61Ec26aA57019C486B10502285c5A3D4A4750AD7`,
        decimals: 8,
      },
      [CHAINID.SEPOLIA]: {
        address: `0x694AA1769357215DE4FAC081bf1f309aDC325306`,
        decimals: 8,
      },
    },
  },
};
