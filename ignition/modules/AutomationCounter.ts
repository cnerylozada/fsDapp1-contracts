import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AutomationCounter", (m) => {
  const _interval = 20;
  const automationCounterContract = m.contract("AutomationCounter", [
    _interval,
  ]);

  return { automationCounterContract };
});
