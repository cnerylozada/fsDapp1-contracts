import { ignition, viem } from "hardhat";
import LotteryModule from "../ignition/modules/lottery/Lottery";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { getAddress, parseEther } from "viem";

describe("Lottery", function () {
  async function deployLotteryFixture() {
    const [owner] = await viem.getWalletClients();
    const prize = parseEther("0.005");
    const numTickets = 3;

    const { lotteryContract } = await ignition.deploy(LotteryModule, {
      parameters: {
        LotteryModule: {
          mainDeployer: owner.account.address,
          numTickets,
          prize,
        },
      },
    });

    const publicClient = await viem.getPublicClient();

    return { lotteryContract, publicClient, owner, prize, numTickets };
  }
  describe("Deployment", async function () {
    it("should set storage variables", async function () {
      const { lotteryContract, owner, prize } = await loadFixture(
        deployLotteryFixture
      );

      expect(await lotteryContract.read.getOwner()).to.equal(
        getAddress(owner.account.address)
      );
      expect(await lotteryContract.read.getPrize()).to.equal(prize);
    });
  });

  describe("Tickets", function () {
    it("should store participants with enough funds", async function () {
      const { lotteryContract, owner } = await loadFixture(
        deployLotteryFixture
      );

      await expect(
        lotteryContract.write.purchaseTicket({
          value: parseEther("0.0009"),
        })
      ).to.be.rejectedWith();

      await lotteryContract.write.purchaseTicket({
        value: parseEther("0.001"),
      });
      const participants = await lotteryContract.read.getParticipants();
      expect(participants[0]).to.equal(getAddress(owner.account.address));
    });
  });
});
