import { ignition, viem } from "hardhat";
import ClassroomFactoryModule from "../ignition/modules/ClassroomFactory";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";

describe("ClassroomFactory", function () {
  async function deployClassroomFactoryContract() {
    const { classroomFactoryContract } = await ignition.deploy(
      ClassroomFactoryModule
    );

    return { classroomFactoryContract };
  }
  describe("Deployment", function () {
    it("should return empty address-list if ", async function () {
      const { classroomFactoryContract } = await loadFixture(
        deployClassroomFactoryContract
      );
      const initiallAddressList =
        await classroomFactoryContract.read.contractsCreated();
      expect(initiallAddressList.length).to.equal(0);
    });
  });

  describe("Emitting event after new contract is created", function () {
    it("should emit address and store it in array", async function () {
      const { classroomFactoryContract } = await loadFixture(
        deployClassroomFactoryContract
      );
      const _courseName = "math 101";
      await classroomFactoryContract.write.createClassroom([_courseName]);

      const newContractCreatedEvents =
        await classroomFactoryContract.getEvents.NewContractCreated();

      const lastAddressAdded = newContractCreatedEvents[0].args.contractAddress;
      const addressList =
        await classroomFactoryContract.read.contractsCreated();
      expect(lastAddressAdded).to.equal(addressList[0].contractAddress);
    });
  });

  describe("Classroom contract from factory", function () {
    it("it should return the same course name setted in the contructor", async function () {
      const { classroomFactoryContract } = await loadFixture(
        deployClassroomFactoryContract
      );

      const _courseName = "math 101";
      await classroomFactoryContract.write.createClassroom([_courseName]);

      const addressList =
        await classroomFactoryContract.read.contractsCreated();
      const lastAddressAdded = addressList[0].contractAddress;
      const classroomContract = await viem.getContractAt(
        "Classroom",
        lastAddressAdded
      );
      const [course] = await classroomContract.read.getMetadata();
      expect(course).to.equal(_courseName);
    });
  });
});
