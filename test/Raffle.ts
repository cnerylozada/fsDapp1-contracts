import { expect } from "chai";
import { ethers, ignition } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import RaffleModule from "../ignition/modules/Raffle/raffle";

describe("testing Raffle contract", () => {
  async function deployRaffleModuleFixture() {
    const [deployer, anotherDeployer] = await ethers.getSigners();
    const { raffleContract } = await ignition.deploy(RaffleModule);
    return { raffleContract, deployer, anotherDeployer };
  }

  describe("about storing during raffle creation", async () => {
    it("should store raffle creator address", async () => {
      const { raffleContract, deployer } = await loadFixture(
        deployRaffleModuleFixture
      );
      await raffleContract.createRaffle();
      const owner = await raffleContract.s_ownersByRaffleId(0);
      expect(owner).to.eql(deployer.address);
    });

    it("should store participants in raffle already created", async () => {
      const { raffleContract, anotherDeployer } = await loadFixture(
        deployRaffleModuleFixture
      );
      await raffleContract.createRaffle();
      await raffleContract
        .connect(anotherDeployer)
        .addNewParticipantByRaffleId(0);
      const participant = await raffleContract.s_participantsByRaffleId(0, 0);
      expect(participant).to.eq(anotherDeployer.address);
    });
  });

  describe("main rules about raffle creation", () => {
    it("should trigger an error when try to add participants in a no existing raffle", async () => {
      const { raffleContract } = await loadFixture(deployRaffleModuleFixture);
      await expect(
        raffleContract.addNewParticipantByRaffleId(99)
      ).to.be.revertedWithCustomError(raffleContract, "Raffle__NoCreated");
    });
    describe("about start a raffle by id", () => {
      it("should return an error when the raffle does not exist", async () => {
        const { raffleContract } = await loadFixture(deployRaffleModuleFixture);
        await expect(
          raffleContract.startRaffleById(99)
        ).to.be.revertedWithCustomError(raffleContract, "Raffle__NoCreated");
      });
      it("shoult return an error when there are no participants added", async () => {
        const { raffleContract } = await loadFixture(deployRaffleModuleFixture);
        await raffleContract.createRaffle();
        await expect(
          raffleContract.startRaffleById(0)
        ).to.be.revertedWithCustomError(
          raffleContract,
          "Raffle__NoParticipantsCreated"
        );
      });
      it("should return an error if someone but the owner try to start it", async () => {
        const { raffleContract, anotherDeployer } = await loadFixture(
          deployRaffleModuleFixture
        );
        await raffleContract.createRaffle();
        await raffleContract.addNewParticipantByRaffleId(0);
        await expect(
          raffleContract.connect(anotherDeployer).startRaffleById(0)
        ).to.be.revertedWithCustomError(raffleContract, "Raffle__OnlyOwner");
      });
    });
    it("should trigger an error when try to get the winner of a no existing raffle", async () => {
      const { raffleContract } = await loadFixture(deployRaffleModuleFixture);
      await expect(
        raffleContract.getWinnerByRaffleId(99)
      ).to.be.revertedWithCustomError(raffleContract, "Raffle__NoCreated");
    });
    it("should trigger an error if you want to know the winner and the raffle has not started yet", async () => {
      const { raffleContract } = await loadFixture(deployRaffleModuleFixture);
      await raffleContract.createRaffle();
      await expect(
        raffleContract.getWinnerByRaffleId(0)
      ).to.be.revertedWithCustomError(
        raffleContract,
        "Raffle__RandomNotCalled"
      );
    });
  });
});
