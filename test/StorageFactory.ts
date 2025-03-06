import { ignition, viem } from "hardhat";
import StorageFactoryModule from "../ignition/modules/StorageFactory";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";

describe("StorageFactory", function () {
  async function deployStorageFactoryContract() {
    const { storageFactoryContract } = await ignition.deploy(
      StorageFactoryModule
    );

    return { storageFactoryContract };
  }
  describe("Deployment", function () {
    it("should return empty address-list if ", async function () {
      const { storageFactoryContract } = await loadFixture(
        deployStorageFactoryContract
      );
      const initiallAddressList =
        await storageFactoryContract.read.getAddressList();
      expect(initiallAddressList.length).to.equal(0);
    });
  });

  describe("Emitting event after new contract is created", function () {
    it("should emit address and store it in array", async function () {
      const { storageFactoryContract } = await loadFixture(
        deployStorageFactoryContract
      );
      const _courseName = "math 101";
      await storageFactoryContract.write.createStorage([_courseName]);

      const newContractCreatedEvents =
        await storageFactoryContract.getEvents.NewContractCreated();

      const lastAddressAdded = newContractCreatedEvents[0].args._address;
      const addressList = await storageFactoryContract.read.getAddressList();
      expect(lastAddressAdded).to.equal(addressList[0]);
    });
  });

  describe("Storage contract from factory", function () {
    it("it should return the same course name setted in the contructor", async function () {
      const { storageFactoryContract } = await loadFixture(
        deployStorageFactoryContract
      );

      const _courseName = "math 101";
      await storageFactoryContract.write.createStorage([_courseName]);

      const addressList = await storageFactoryContract.read.getAddressList();
      const lastAddressAdded = addressList[0];
      const storageContract = await viem.getContractAt(
        "Storage",
        lastAddressAdded
      );
      const [course] = await storageContract.read.getMetadata();
      expect(course).to.equal(_courseName);
    });
  });
});
