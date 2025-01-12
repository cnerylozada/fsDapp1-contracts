import { ignition, viem } from "hardhat";
import FundMeModule from "../ignition/modules/fundMe/FundMe";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { parseEther } from "viem";

describe("FunMe", function () {
  async function deployFundMeContract() {
    const [owner, addr1] = await viem.getWalletClients();
    const _minAmountInUSD = BigInt(5);
    const { fundMeContract } = await ignition.deploy(FundMeModule, {
      parameters: { FundMeModule: { _minAmountInUSD } },
    });
    const publicClient = await viem.getPublicClient();
    return {
      _minAmountInUSD,
      fundMeContract,
      owner,
      addr1,
      publicClient,
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

  describe("fund method", function () {
    it("should update the contract balance if ETH are sent", async function () {
      const { fundMeContract, publicClient } = await loadFixture(
        deployFundMeContract
      );
      const amountToSend = parseEther("0.0015");
      await fundMeContract.write.fund({ value: amountToSend });
      expect(
        await publicClient.getBalance({
          address: fundMeContract.address,
        })
      ).to.equal(amountToSend);
      expect(await fundMeContract.read.getBalance()).to.equal(amountToSend);
    });

    it("asd", async function () {
      const { fundMeContract } = await loadFixture(deployFundMeContract);
      await expect(
        fundMeContract.write.fund({ value: BigInt(4) })
      ).to.be.rejectedWith("FundMe_NotEnoughFunds");
    });
  });
});
