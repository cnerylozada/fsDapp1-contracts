import { expect } from "chai";
import { ethers, ignition } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import MultiRaffleModule from "../ignition/modules/MultiRaffle/multiRaffle";

describe("testing Raffle contract", () => {
  const SECONDS_TO_START = 99;
  const DEFAULT_RAFFLE_ITERATOR = 0;
  const VALID_FEE_IN_ETH = ethers.parseEther("0.0014");
  const INVALID_FEE_IN_ETH = ethers.parseEther("0.0010");

  async function deployRaffleModuleFixture() {
    const [deployer, anotherDeployer, customerOne] = await ethers.getSigners();
    const { multiRaffleContract, mockVRFCoordinatorV2_5Contract } =
      await ignition.deploy(MultiRaffleModule);
    return {
      mockVRFCoordinatorV2_5Contract,
      multiRaffleContract,
      deployer,
      anotherDeployer,
      customerOne,
    };
  }

  describe("about storing during raffle creation", async () => {
    it("should store raffle creator address", async () => {
      const { multiRaffleContract, deployer, anotherDeployer } =
        await loadFixture(deployRaffleModuleFixture);
      let raffleIterator = DEFAULT_RAFFLE_ITERATOR;

      await multiRaffleContract.createRaffle(
        SECONDS_TO_START,
        VALID_FEE_IN_ETH
      );
      const oldRaffleOwner = await multiRaffleContract.s_raffleIdToOwner(
        raffleIterator
      );
      expect(oldRaffleOwner).to.eql(deployer.address);

      ++raffleIterator;
      await multiRaffleContract
        .connect(anotherDeployer)
        .createRaffle(SECONDS_TO_START, VALID_FEE_IN_ETH);
      const newRaffleOwner = await multiRaffleContract.s_raffleIdToOwner(
        raffleIterator
      );
      expect(newRaffleOwner).to.eql(anotherDeployer.address);
    });

    it("should store participants in raffle already created", async () => {
      const { multiRaffleContract, deployer } = await loadFixture(
        deployRaffleModuleFixture
      );
      await expect(
        multiRaffleContract.addNewParticipantByRaffleId(
          DEFAULT_RAFFLE_ITERATOR,
          { value: VALID_FEE_IN_ETH }
        )
      ).to.be.revertedWithCustomError(multiRaffleContract, "Raffle__NoCreated");

      await multiRaffleContract.createRaffle(
        SECONDS_TO_START,
        VALID_FEE_IN_ETH
      );
      await expect(
        multiRaffleContract.addNewParticipantByRaffleId(
          DEFAULT_RAFFLE_ITERATOR,
          {
            value: INVALID_FEE_IN_ETH,
          }
        )
      ).to.be.revertedWithCustomError(
        multiRaffleContract,
        "Raffle__SendMoreToEnterRaffle"
      );
      await multiRaffleContract.addNewParticipantByRaffleId(
        DEFAULT_RAFFLE_ITERATOR,
        {
          value: VALID_FEE_IN_ETH,
        }
      );
      const participant = await multiRaffleContract.s_raffleIdToParticipants(
        0,
        0
      );
      expect(participant).to.eq(deployer.address);
    });
  });

  describe("main rules about raffle creation", () => {
    describe("about start a raffle by id", () => {
      it("should return an error when it does not exist", async () => {
        const { multiRaffleContract } = await loadFixture(
          deployRaffleModuleFixture
        );
        await expect(
          multiRaffleContract.startRaffleById(99)
        ).to.be.revertedWithCustomError(
          multiRaffleContract,
          "Raffle__NoCreated"
        );
      });
      it("shoult return an error when there are no participants added", async () => {
        const { multiRaffleContract } = await loadFixture(
          deployRaffleModuleFixture
        );
        await multiRaffleContract.createRaffle(
          SECONDS_TO_START,
          VALID_FEE_IN_ETH
        );
        await expect(
          multiRaffleContract.startRaffleById(DEFAULT_RAFFLE_ITERATOR)
        ).to.be.revertedWithCustomError(
          multiRaffleContract,
          "Raffle__NoParticipantsCreated"
        );
      });
      it("should return an error if someone but the owner try to start it", async () => {
        const { multiRaffleContract, anotherDeployer } = await loadFixture(
          deployRaffleModuleFixture
        );
        await multiRaffleContract.createRaffle(
          SECONDS_TO_START,
          VALID_FEE_IN_ETH
        );
        await multiRaffleContract.addNewParticipantByRaffleId(
          DEFAULT_RAFFLE_ITERATOR,
          { value: VALID_FEE_IN_ETH }
        );
        await expect(
          multiRaffleContract
            .connect(anotherDeployer)
            .startRaffleById(DEFAULT_RAFFLE_ITERATOR)
        ).to.be.revertedWithCustomError(
          multiRaffleContract,
          "Raffle__OnlyOwner"
        );
      });
    });
    it("should trigger an error when try to get the winner of a no existing raffle", async () => {
      const { multiRaffleContract } = await loadFixture(
        deployRaffleModuleFixture
      );
      await expect(
        multiRaffleContract.getWinnerByRaffleId(99)
      ).to.be.revertedWithCustomError(multiRaffleContract, "Raffle__NoCreated");
    });
    it("should trigger an error if you want to know the winner and the raffle has not started yet", async () => {
      const { multiRaffleContract } = await loadFixture(
        deployRaffleModuleFixture
      );
      await multiRaffleContract.createRaffle(
        SECONDS_TO_START,
        VALID_FEE_IN_ETH
      );
      await expect(
        multiRaffleContract.getWinnerByRaffleId(DEFAULT_RAFFLE_ITERATOR)
      ).to.be.revertedWithCustomError(
        multiRaffleContract,
        "Raffle__RandomNotCalled"
      );
    });
  });

  describe("about looking for the wiinner", async () => {
    it("should return an error when the election is in progress", async () => {
      const { multiRaffleContract, anotherDeployer } = await loadFixture(
        deployRaffleModuleFixture
      );
      await multiRaffleContract.createRaffle(
        SECONDS_TO_START,
        VALID_FEE_IN_ETH
      );

      await multiRaffleContract.addNewParticipantByRaffleId(
        DEFAULT_RAFFLE_ITERATOR,
        { value: VALID_FEE_IN_ETH }
      );
      await multiRaffleContract
        .connect(anotherDeployer)
        .addNewParticipantByRaffleId(DEFAULT_RAFFLE_ITERATOR, {
          value: VALID_FEE_IN_ETH,
        });
      await multiRaffleContract.startRaffleById(DEFAULT_RAFFLE_ITERATOR);

      await expect(
        multiRaffleContract.startRaffleById(DEFAULT_RAFFLE_ITERATOR)
      ).to.be.revertedWithCustomError(
        multiRaffleContract,
        "Raffle__RandomAlreadyCalled"
      );
      await expect(
        multiRaffleContract.addNewParticipantByRaffleId(
          DEFAULT_RAFFLE_ITERATOR,
          { value: VALID_FEE_IN_ETH }
        )
      ).to.be.revertedWithCustomError(
        multiRaffleContract,
        "Raffle__RandomInProgress"
      );
      await expect(
        multiRaffleContract.getWinnerByRaffleId(DEFAULT_RAFFLE_ITERATOR)
      ).to.be.revertedWithCustomError(
        multiRaffleContract,
        "Raffle__RandomInProgress"
      );
    });
  });

  describe("after random choice is triggered", async () => {
    it("...", async () => {
      const {
        multiRaffleContract,
        mockVRFCoordinatorV2_5Contract,
        deployer,
        anotherDeployer,
        customerOne,
      } = await loadFixture(deployRaffleModuleFixture);
      await multiRaffleContract.createRaffle(
        SECONDS_TO_START,
        VALID_FEE_IN_ETH
      );

      await multiRaffleContract.addNewParticipantByRaffleId(
        DEFAULT_RAFFLE_ITERATOR,
        { value: VALID_FEE_IN_ETH }
      );
      await multiRaffleContract
        .connect(anotherDeployer)
        .addNewParticipantByRaffleId(DEFAULT_RAFFLE_ITERATOR, {
          value: VALID_FEE_IN_ETH,
        });
      await multiRaffleContract
        .connect(customerOne)
        .addNewParticipantByRaffleId(DEFAULT_RAFFLE_ITERATOR, {
          value: VALID_FEE_IN_ETH,
        });

      await new Promise<void>(async (resolve) => {
        multiRaffleContract.once("RawWinnerByRaffleId", async () => {
          resolve();
        });

        await multiRaffleContract.startRaffleById(DEFAULT_RAFFLE_ITERATOR);
        const filter = multiRaffleContract.filters.RequestIdByRaffleId();
        const requestIdByRaffleIdEvent = await multiRaffleContract.queryFilter(
          filter
        );
        const requestId = requestIdByRaffleIdEvent[0].args[1];
        await mockVRFCoordinatorV2_5Contract.fulfillRandomWords(
          requestId,
          multiRaffleContract
        );
      });
    });
  });
});
