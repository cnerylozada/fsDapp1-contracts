import { ignition, viem } from "hardhat";
import FundMeModule from "../ignition/modules/FundMe";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";

describe("FunMe", function () {
  async function deployFundMeContract() {
    const [owner, addr1] = await viem.getWalletClients();
    const _minAmountInUSD = BigInt(5);
    const { fundMeContract } = await ignition.deploy(FundMeModule, {
      parameters: { FundMeModule: { _minAmountInUSD } },
    });
    return {
      _minAmountInUSD,
      fundMeContract,
      owner,
      addr1,
    };
  }
  describe("Deployment", function () {
    it("should set contructor params", async function () {
      const { _minAmountInUSD, fundMeContract } = await loadFixture(
        deployFundMeContract
      );
      expect(await fundMeContract.read.getMinAmountInUSD()).to.equal(
        _minAmountInUSD
      );
    });
  });
});
