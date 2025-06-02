import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { network } from "hardhat";
import { CHAINID } from "../../utils/utils";

const ClassroomModule = buildModule("ClassroomModule", (m) => {
  const currentNetwork = network.config.chainId;
  let courseName = "default_course";
  if (currentNetwork === CHAINID.SEPOLIA) courseName = "science_sepolia";
  if (currentNetwork === CHAINID.OPTIMISMSEPOLIA)
    courseName = "science_opSepolia";

  const _course = m.getParameter("_course", courseName);
  const _createdAt = m.getParameter("_createdAt", 1748882008);
  const classroomContract = m.contract("Classroom", [_course, _createdAt]);
  return { classroomContract };
});

export default ClassroomModule;
