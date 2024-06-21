import { network } from "hardhat";
import { blockChainId } from "../../utils/utils";

network.config.chainId === blockChainId.localhost
  ? describe.skip
  : describe("testing FundMe contract", () => {
      it("...", () => {});
    });
