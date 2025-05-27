import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ClassroomFactoryModule = buildModule("ClassroomFactoryModule", (m) => {
  const classroomFactoryContract = m.contract("ClassroomFactory");
  return { classroomFactoryContract };
});

export default ClassroomFactoryModule;
