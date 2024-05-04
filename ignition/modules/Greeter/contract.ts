import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Greeter", (m) => {
  const contractArgs = {
    _greeting: m.getParameter("_greeting", "Hello world!"),
  };
  const greeterContract = m.contract("Greeter", [contractArgs._greeting]);
  return { greeterContract };
});
