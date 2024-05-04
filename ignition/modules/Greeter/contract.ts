import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Greeter", (m) => {
  const contractArgs = {
    _greeting: m.getParameter("_greeting", "Hello world!"),
  };
  const mainSepoliaAccount = m.getAccount(0);
  const greeterContract = m.contract("Greeter", [contractArgs._greeting], {
    from: mainSepoliaAccount,
  });
  if (process.env.ALCHEMY_SEPOLIA_APIKEY) {
    console.log("deploying to sepolia network...");
  }
  return { greeterContract };
});
