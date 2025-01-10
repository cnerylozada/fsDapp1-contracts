import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { ignition, viem } from "hardhat";
import StorageModule from "../ignition/modules/Storage";
import { expect } from "chai";

describe("Storage", function () {
  async function deployStorageContract() {
    const [owner, addr1] = await viem.getWalletClients();
    const _course = "test_course";
    const { storageContract } = await ignition.deploy(StorageModule, {
      parameters: { StorageModule: { _course } },
    });
    return {
      _course,
      storageContract,
      owner,
      addr1,
    };
  }

  describe("Deployment", function () {
    it("should set constructor param", async function () {
      const { storageContract, _course } = await loadFixture(
        deployStorageContract
      );
      expect(await storageContract.read.getCourse()).to.equal(_course);
    });
  });
});
