import { expect } from "chai";
import { ignition, ethers } from "hardhat";
import FundMeModule from "../../ignition/modules/FundMe/fundMe";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("testing FundMe Contract", function () {
  const deployContract = async () => {
    const [deployer, otherAccount] = await ethers.getSigners();
    const { fundMe, mockDataFeed } = await ignition.deploy(FundMeModule);
    return { fundMe, mockDataFeed, deployer, otherAccount };
  };

  it("should set dataFeed value correctly", async () => {
    const { fundMe, mockDataFeed } = await loadFixture(deployContract);
    const dataFeed = await fundMe.dataFeed();
    expect(dataFeed).to.eq(mockDataFeed);
  });

  describe("fund function", () => {
    it("should fail if there was not enough funds sent", async () => {
      const { fundMe } = await loadFixture(deployContract);
      await expect(fundMe.fund()).to.reverted;
    });

    it("should store funds from funders", async () => {
      const { fundMe, otherAccount } = await loadFixture(deployContract);
      const amountSent = ethers.parseEther("1");
      await fundMe.connect(otherAccount).fund({ value: amountSent });
      const amountReceived = await fundMe.addressToAmountFunded(
        otherAccount.address
      );
      expect(amountSent.toString()).to.be.eq(amountReceived.toString());

      const contractBalance = await ethers.provider.getBalance(fundMe);
      expect(contractBalance).to.be.eq(amountSent);
    });

    it("should store funder address after fund", async () => {
      const { fundMe, otherAccount } = await loadFixture(deployContract);
      const amountSent = ethers.parseEther("1");
      await fundMe.connect(otherAccount).fund({ value: amountSent });

      const firstFunderIndex = 0;
      const funderAddress = await fundMe.funders(firstFunderIndex);
      expect(funderAddress).to.be.eq(otherAccount.address);
    });
  });

  describe("withdraw function", () => {
    it("should not withdraw when the owner dint perform it", async () => {
      const { fundMe, otherAccount } = await loadFixture(deployContract);
      await expect(fundMe.connect(otherAccount).withdraw()).to.be.rejectedWith(
        "FundMe__NotOwner"
      );
    });

    it("should update contract balance after withdraw", async () => {
      const { fundMe, deployer, otherAccount } = await loadFixture(
        deployContract
      );
      const amountSent = ethers.parseEther("1");
      await fundMe.connect(otherAccount).fund({ value: amountSent });

      const startingContractBalance = await ethers.provider.getBalance(fundMe);
      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      );
      const withdrawTx = await fundMe.withdraw();
      const { gasPrice, gasUsed } = await withdrawTx.wait(1);
      const gasCost = (gasPrice as bigint) * (gasUsed as bigint);
      const endingDeployerBalance = await ethers.provider.getBalance(deployer);
      expect(startingContractBalance + startingDeployerBalance).to.be.eq(
        endingDeployerBalance + gasCost
      );
    });
  });
});
