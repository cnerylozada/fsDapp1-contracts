import { ignition } from "hardhat";
import AutomationCounterModule from "../../ignition/modules/AutomationCounter";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

describe("testing AutomationCounter contract", () => {
  async function deployAutomationCounterModuleFixture() {
    const { automationCounterContract } = await ignition.deploy(
      AutomationCounterModule
    );
    return { automationCounterContract };
  }

  it("should be falsy condition to perform-upkeep if interval has not passed", async () => {
    const { automationCounterContract } = await loadFixture(
      deployAutomationCounterModuleFixture
    );
    const [upkeepNeeded] = await automationCounterContract.checkUpkeep("0x");
    expect(upkeepNeeded).to.be.false;

    const counter: bigint = await automationCounterContract.counter();
    await automationCounterContract.performUpkeep("0x");
    expect(+counter.toString()).to.eq(0);
  });

  it("should be true condition to perform-upkeep after interval time", async () => {
    const { automationCounterContract } = await loadFixture(
      deployAutomationCounterModuleFixture
    );

    const initialRawCounter: bigint = await automationCounterContract.counter();
    const initialCounter = +initialRawCounter.toString();

    const rawInterval: bigint = await automationCounterContract.interval();
    const interval = +rawInterval.toString();
    await time.increase(interval + 1);
    const [upkeepNeeded] = await automationCounterContract.checkUpkeep("0x");
    expect(upkeepNeeded).to.be.true;

    await automationCounterContract.performUpkeep("0x");
    const finalRawCounter: bigint = await automationCounterContract.counter();
    const finalCounter = +finalRawCounter.toString();

    expect(finalCounter).to.eq(initialCounter + 1);
  });
});
