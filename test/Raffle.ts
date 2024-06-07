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
  describe("default state", () => {
    it("should store raffle creator address", async () => {
      const { raffleContract, deployer } = await loadFixture(
        deployRaffleModuleFixture
      );
      await raffleContract.createRaffle();
      const owner = await raffleContract.s_ownersByRaffleId(0);
      expect(owner).to.eql(deployer.address);
    });

    // it("should store participants in raffle already created", async () => {
    //   const { raffleContract, deployer } = await loadFixture(
    //     deployRaffleModuleFixture
    //   );

    //   await expect(
    //     raffleContract.addNewParticipantByRaffleId(0)
    //   ).to.be.revertedWithCustomError(raffleContract, "Raffle__NoCreated");

    //   await raffleContract.createRaffle();
    //   const raffleId = 0;
    //   await raffleContract.addNewParticipantByRaffleId(raffleId);
    //   const participant = await raffleContract.mapRaffleIdToParticipants(
    //     raffleId,
    //     0
    //   );
    //   expect(participant).to.eq(deployer.address);
    // });
  });
});
