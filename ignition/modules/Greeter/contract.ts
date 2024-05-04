import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Greeter", (m) => {
  const contractArgs = {
    _greeting: m.getParameter("_greeting", "Hello world!"),
  };
  const mainSepoliaAccount = m.getAccount(0);
  const greeterContract = m.contract("Greeter", [contractArgs._greeting], {
    from: mainSepoliaAccount,
  });
  return { greeterContract };
});
