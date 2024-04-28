import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
export default buildModule("RocketContract", (m) => {
  const contractArgs = {
    name: m.getParameter("name"),
  };
  const rocketContract = m.contract("Rocket", [contractArgs.name]);
  return { rocketContract };
});
