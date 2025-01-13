import { ignition, viem } from "hardhat";
import FundMeModule from "../ignition/modules/fundMe/FundMe";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { parseEther } from "viem";

describe("FunMe", function () {
  async function deployFundMeContract() {
    const [owner, addr1, addr2] = await viem.getWalletClients();
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
      addr2,
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
      const amountToSend = parseEther("0.0016");
      await fundMeContract.write.fund({ value: amountToSend });
      expect(
        await publicClient.getBalance({
          address: fundMeContract.address,
        })
      ).to.equal(amountToSend);
      expect(await fundMeContract.read.getBalance()).to.equal(amountToSend);
    });

    it("should revert when amount is less than minimum", async function () {
      const { fundMeContract } = await loadFixture(deployFundMeContract);
      await expect(
        fundMeContract.write.fund({ value: parseEther("0.0012") })
      ).to.be.rejectedWith("FundMe_NotEnoughFunds");
    });
  });

  describe("withdraw method", function () {
    it("should revert if owner is not called it", async function () {
      const { addr1, fundMeContract } = await loadFixture(deployFundMeContract);
      const fundMeOtherAccount = await viem.getContractAt(
        "FundMe",
        fundMeContract.address,
        { client: { wallet: addr1 } }
      );
      const amountToSend = parseEther("0.0016");
      await fundMeOtherAccount.write.fund({ value: amountToSend });
      await expect(fundMeOtherAccount.write.withdraw()).to.be.rejectedWith(
        "FundMe_OnlyOwner"
      );
    });

    it("should update owner balance after withdraw", async function () {
      const { owner, addr1, fundMeContract, publicClient } = await loadFixture(
        deployFundMeContract
      );

      const amountToSend = parseEther("1");
      const fundMeOtherAccount = await viem.getContractAt(
        "FundMe",
        fundMeContract.address,
        { client: { wallet: addr1 } }
      );
      await fundMeOtherAccount.write.fund({ value: amountToSend });
      const contractBalance = await publicClient.getBalance({
        address: fundMeContract.address,
      });

      const initialOwnerBalance = await publicClient.getBalance({
        address: owner.account.address,
      });

      const withdrawTx = await fundMeContract.write.withdraw();
      const { gasUsed, effectiveGasPrice } =
        await publicClient.getTransactionReceipt({
          hash: withdrawTx,
        });

      const finalOwnerBalance = await publicClient.getBalance({
        address: owner.account.address,
      });

      expect(finalOwnerBalance).to.equal(
        initialOwnerBalance + contractBalance - gasUsed * effectiveGasPrice
      );
    });
  });
});
