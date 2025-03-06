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
      const [course] = await storageContract.read.getMetadata();
      expect(course).to.equal(_course);
    });
  });

  describe("Adding new student", function () {
    it("should emit an event when new student is added", async function () {
      const { storageContract } = await loadFixture(deployStorageContract);

      const _name = "cristh";
      await storageContract.write.addNewStudent([_name, 0]);
      const newStudentAddedEvents =
        await storageContract.getEvents.NewStudentAdded();
      expect(newStudentAddedEvents).to.have.lengthOf(1);
      expect(newStudentAddedEvents[0].args._name).to.equal(_name);
    });

    it("should store new student data", async function () {
      const { storageContract } = await loadFixture(deployStorageContract);

      const _name = "cristh";
      await storageContract.write.addNewStudent([_name, 0]);
      const index = BigInt(0);
      const student = await storageContract.read.getStudentByIndex([index]);
      const [studenName] = student;
      expect(studenName).to.equal(_name);
    });
  });
});
