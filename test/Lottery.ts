import { ignition, viem } from "hardhat";
import LotteryModule from "../ignition/modules/lottery/Lottery";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { getAddress, parseEther } from "viem";

describe("Lottery", function () {
  async function deployLotteryFixture() {
    const [owner] = await viem.getWalletClients();
    const prize = parseEther("0.005");

    const { lotteryContract } = await ignition.deploy(LotteryModule, {
      parameters: {
        LotteryModule: {
          mainDeployer: owner.account.address,
          numTickets: 3,
          prize,
        },
      },
    });

    const publicClient = await viem.getPublicClient();

    return { lotteryContract, publicClient, owner, prize };
  }
  describe("Deployment", async function () {
    it("should set storage variables", async function () {
      const { lotteryContract, owner, publicClient, prize } = await loadFixture(
        deployLotteryFixture
      );

      expect(await lotteryContract.read.getOwner()).to.equal(
        getAddress(owner.account.address)
      );
      expect(await lotteryContract.read.getPrize()).to.equal(prize);
    });
  });
});
