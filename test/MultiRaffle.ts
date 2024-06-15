import { expect } from "chai";
import { ethers, ignition } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import RaffleModule from "../ignition/modules/MultiRaffle/multiRaffle";

describe("testing Raffle contract", () => {
  const SECONDS_TO_START = 99;
  const FEE_IN_USD = 25;
  const DEFAULT_RAFFLE_ITERATOR = 0;

  async function deployRaffleModuleFixture() {
    const [deployer, anotherDeployer, customerOne] = await ethers.getSigners();
    const { raffleContract, mockVRFCoordinatorV2_5Contract } =
      await ignition.deploy(RaffleModule);
    return {
      mockVRFCoordinatorV2_5Contract,
      raffleContract,
      deployer,
      anotherDeployer,
      customerOne,
    };
  }

  describe("about storing during raffle creation", async () => {
    it("should store raffle creator address", async () => {
      const { raffleContract, deployer, anotherDeployer } = await loadFixture(
        deployRaffleModuleFixture
      );
      let raffleIterator = DEFAULT_RAFFLE_ITERATOR;

      await raffleContract.createRaffle(SECONDS_TO_START, FEE_IN_USD);
      const oldRaffleOwner = await raffleContract.s_raffleIdToOwner(
        raffleIterator
      );
      expect(oldRaffleOwner).to.eql(deployer.address);

      ++raffleIterator;
      await raffleContract
        .connect(anotherDeployer)
        .createRaffle(SECONDS_TO_START, FEE_IN_USD);
      const newRaffleOwner = await raffleContract.s_raffleIdToOwner(
        raffleIterator
      );
      expect(newRaffleOwner).to.eql(anotherDeployer.address);
    });

    it("should store participants in raffle already created", async () => {
      const { raffleContract, anotherDeployer } = await loadFixture(
        deployRaffleModuleFixture
      );
      await expect(
        raffleContract.addNewParticipantByRaffleId(DEFAULT_RAFFLE_ITERATOR)
      ).to.be.revertedWithCustomError(raffleContract, "Raffle__NoCreated");

      await raffleContract.createRaffle(SECONDS_TO_START, FEE_IN_USD);
      await raffleContract
        .connect(anotherDeployer)
        .addNewParticipantByRaffleId(DEFAULT_RAFFLE_ITERATOR);
      const participant = await raffleContract.s_raffleIdToParticipants(0, 0);
      expect(participant).to.eq(anotherDeployer.address);
    });
  });

  describe("main rules about raffle creation", () => {
    describe("about start a raffle by id", () => {
      it("should return an error when it does not exist", async () => {
        const { raffleContract } = await loadFixture(deployRaffleModuleFixture);
        await expect(
          raffleContract.startRaffleById(99)
        ).to.be.revertedWithCustomError(raffleContract, "Raffle__NoCreated");
      });
      it("shoult return an error when there are no participants added", async () => {
        const { raffleContract } = await loadFixture(deployRaffleModuleFixture);
        await raffleContract.createRaffle(SECONDS_TO_START, FEE_IN_USD);
        await expect(
          raffleContract.startRaffleById(DEFAULT_RAFFLE_ITERATOR)
        ).to.be.revertedWithCustomError(
          raffleContract,
          "Raffle__NoParticipantsCreated"
        );
      });
      it("should return an error if someone but the owner try to start it", async () => {
        const { raffleContract, anotherDeployer } = await loadFixture(
          deployRaffleModuleFixture
        );
        await raffleContract.createRaffle(SECONDS_TO_START, FEE_IN_USD);
        await raffleContract.addNewParticipantByRaffleId(
          DEFAULT_RAFFLE_ITERATOR
        );
        await expect(
          raffleContract
            .connect(anotherDeployer)
            .startRaffleById(DEFAULT_RAFFLE_ITERATOR)
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
      await raffleContract.createRaffle(SECONDS_TO_START, FEE_IN_USD);
      await expect(
        raffleContract.getWinnerByRaffleId(DEFAULT_RAFFLE_ITERATOR)
      ).to.be.revertedWithCustomError(
        raffleContract,
        "Raffle__RandomNotCalled"
      );
    });
  });

  describe("about looking for the wiinner", async () => {
    it("should return an error when the election is in progress", async () => {
      const { raffleContract, anotherDeployer } = await loadFixture(
        deployRaffleModuleFixture
      );
      await raffleContract.createRaffle(SECONDS_TO_START, FEE_IN_USD);

      await raffleContract.addNewParticipantByRaffleId(DEFAULT_RAFFLE_ITERATOR);
      await raffleContract
        .connect(anotherDeployer)
        .addNewParticipantByRaffleId(DEFAULT_RAFFLE_ITERATOR);
      await raffleContract.startRaffleById(DEFAULT_RAFFLE_ITERATOR);

      await expect(
        raffleContract.startRaffleById(DEFAULT_RAFFLE_ITERATOR)
      ).to.be.revertedWithCustomError(
        raffleContract,
        "Raffle__RandomAlreadyCalled"
      );
      await expect(
        raffleContract.addNewParticipantByRaffleId(DEFAULT_RAFFLE_ITERATOR)
      ).to.be.revertedWithCustomError(
        raffleContract,
        "Raffle__RandomInProgress"
      );
      await expect(
        raffleContract.getWinnerByRaffleId(DEFAULT_RAFFLE_ITERATOR)
      ).to.be.revertedWithCustomError(
        raffleContract,
        "Raffle__RandomInProgress"
      );
    });
  });

  describe("after random choice is triggered", () => {
    it("...", async () => {
      const {
        raffleContract,
        mockVRFCoordinatorV2_5Contract,
        deployer,
        anotherDeployer,
        customerOne,
      } = await loadFixture(deployRaffleModuleFixture);
      await raffleContract.createRaffle(SECONDS_TO_START, FEE_IN_USD);
      [deployer, anotherDeployer, customerOne].forEach(async (_) => {
        await raffleContract
          .connect(_)
          .addNewParticipantByRaffleId(DEFAULT_RAFFLE_ITERATOR);
      });

      await new Promise<void>(async (resolve) => {
        raffleContract.once("RawWinnerByRaffleId", async () => {
          const xxx = resolve();
        });

        await raffleContract.startRaffleById(DEFAULT_RAFFLE_ITERATOR);
        const filter = raffleContract.filters.RequestIdByRaffleId();
        const requestIdByRaffleIdEvent = await raffleContract.queryFilter(
          filter
        );
        const requestId = requestIdByRaffleIdEvent[0].args[1];
        await mockVRFCoordinatorV2_5Contract.fulfillRandomWords(
          requestId,
          raffleContract
        );
      });
    });
  });
});
