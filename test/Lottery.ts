import { ignition, viem } from "hardhat";
import LotteryModule from "../ignition/modules/lottery/Lottery";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { getAddress, parseEther } from "viem";

describe("Lottery", function () {
  async function deployLotteryFixture() {
    const [owner] = await viem.getWalletClients();
    const prize = parseEther("0.005");
    const numTickets = 5;
    const publicClient = await viem.getPublicClient();
    const { lotteryContract, VRFCoordinatorV2_5MockContract } =
      await ignition.deploy(LotteryModule, {
        parameters: {
          LotteryModule: {
            mainDeployer: owner.account.address,
            numTickets,
            prize,
          },
        },
      });

    return {
      VRFCoordinatorV2_5MockContract,
      lotteryContract,
      publicClient,
      owner,
      prize,
      numTickets,
    };
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

  describe("Randomness", function () {
    it("shouldl ...", async function () {
      const { VRFCoordinatorV2_5MockContract, lotteryContract, numTickets } =
        await loadFixture(deployLotteryFixture);

      await lotteryContract.write.purchaseTicket({
        value: parseEther("0.001"),
      });
      await lotteryContract.write.purchaseTicket({
        value: parseEther("0.001"),
      });
      await lotteryContract.write.purchaseTicket({
        value: parseEther("0.001"),
      });

      await lotteryContract.write.requestWinner();

      const requestId = await lotteryContract.read.getRequestId();
      await VRFCoordinatorV2_5MockContract.write.fulfillRandomWords([
        requestId,
        lotteryContract.address,
      ]);

      const randomWordEvent = await lotteryContract.getEvents.RandomWord();
      const word = randomWordEvent[0].args._word;

      const winnerAddress = await lotteryContract.read.getWinnerAddress();
    });
  });
});
