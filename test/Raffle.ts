import { expect } from "chai";
import { ethers, ignition } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import RaffleModule from "../ignition/modules/Raffle/raffle";

describe("testing Raffle contract", () => {
  async function deployRaffleModuleFixture() {
    const [deployer, anotherDeployer] = await ethers.getSigners();
    const { raffleContract } = await ignition.deploy(RaffleModule);
    return { raffleContract, deployer };
  }
  it("should store address of raffle creator", async () => {
    const { raffleContract, deployer } = await loadFixture(
      deployRaffleModuleFixture
    );
    await raffleContract.createRaffle();
    const owner = await raffleContract.mapRaffleIdToOwner(0);
    expect(owner).to.eql(deployer.address);
  });
});
