import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ignition } from "hardhat";
import GreeterContractModule from "../../ignition/modules/Greeter";

describe("Testing Greeter contract", () => {
  async function deployGreeterContract() {
    const defaultGreeting = "Welcome to my world";
    const { greeterContract } = await ignition.deploy(GreeterContractModule, {
      parameters: {
        Greeter: {
          _greeting: defaultGreeting,
        },
      },
    });
    return { greeterContract, defaultGreeting };
  }

  it("should store greet message passed as argument in constructor", async () => {
    const { defaultGreeting, greeterContract } = await loadFixture(
      deployGreeterContract
    );
    expect(await greeterContract.greet()).to.equal(defaultGreeting);
  });

  it("should change the greet when setGreeting is invoked", async () => {
    const { greeterContract } = await loadFixture(deployGreeterContract);
    await greeterContract.setGreeting("New message");
    expect(await greeterContract.greet()).to.equal("New message");
  });
});
