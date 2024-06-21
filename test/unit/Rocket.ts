import { expect } from "chai";
import { ignition } from "hardhat";
import RocketModule from "../../ignition/modules/Rocket/contract";

describe("testing Rocket Contract", function () {
  const deployRocketContract = async (args: { name: string }) => {
    const { rocketContract } = await ignition.deploy(RocketModule, {
      parameters: {
        RocketContract: {
          name: args.name,
        },
      },
    });
    return rocketContract;
  };

  it("should set contructor parameters", async () => {
    const _name = "Saturn";
    const rocketContract = await deployRocketContract({ name: _name });
    const rocketName = await rocketContract.name();
    expect(rocketName).to.eq(_name);
  });

  it("should change status after launch", async () => {
    const _name = "Saturn";
    const rocketContract = await deployRocketContract({ name: _name });
    const defaultStatus = await rocketContract.status();
    expect(defaultStatus).to.eq("ignition");
    await rocketContract.launch();
    const statusAfterLaunch = await rocketContract.status();
    expect(statusAfterLaunch).to.eq("lift-off");
  });
});
