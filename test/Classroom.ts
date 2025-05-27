import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { ignition, viem } from "hardhat";
import ClassroomModule from "../ignition/modules/Classroom";
import { expect } from "chai";

describe("Classroom", function () {
  async function deployClassroomContract() {
    const [owner, addr1] = await viem.getWalletClients();
    const _course = "test_course";
    const { classroomContract } = await ignition.deploy(ClassroomModule, {
      parameters: { ClassroomModule: { _course } },
    });
    return {
      _course,
      classroomContract,
      owner,
      addr1,
    };
  }

  describe("Deployment", function () {
    it("should set constructor param", async function () {
      const { classroomContract, _course } = await loadFixture(
        deployClassroomContract
      );
      const [course] = await classroomContract.read.getMetadata();
      expect(course).to.equal(_course);
    });
  });

  describe("Adding new student", function () {
    it("should emit an event when new student is added", async function () {
      const { classroomContract } = await loadFixture(deployClassroomContract);

      const _name = "cristh";
      await classroomContract.write.addNewStudent([_name, 0]);
      const newStudentAddedEvents =
        await classroomContract.getEvents.NewStudentAdded();
      expect(newStudentAddedEvents).to.have.lengthOf(1);
      expect(newStudentAddedEvents[0].args._name).to.equal(_name);
    });

    it("should store new student data", async function () {
      const { classroomContract } = await loadFixture(deployClassroomContract);

      const _name = "cristh";
      await classroomContract.write.addNewStudent([_name, 0]);
      const index = BigInt(0);
      const student = await classroomContract.read.getStudentByIndex([index]);
      const [studenName] = student;
      expect(studenName).to.equal(_name);
    });
  });
});
