import { expect } from "chai";
import { ignition } from "hardhat";
import FundMeModule from "../ignition/modules/FundMe/contracts/fundMe";

describe("testing Rocket Contract", function () {
  const deployRocketContract = async () => {
    const { fundMe, mockDataFeed } = await ignition.deploy(FundMeModule);
    return { fundMe, mockDataFeed };
  };

  it("should ", async () => {
    const { fundMe, mockDataFeed } = await deployRocketContract();
    const dataFeed = await fundMe.dataFeed();
    expect(dataFeed).to.eq(mockDataFeed);
  });
});
