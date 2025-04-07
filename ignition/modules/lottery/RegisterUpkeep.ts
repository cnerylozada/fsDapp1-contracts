import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { network } from "hardhat";
import { chainlinkAutomationSupportedNetworks } from "../../../utils/chainlink";

const RegisterUpkeepModule = buildModule("RegisterUpkeepModule", (m) => {
  const chainId = network.config.chainId;
  const { LINKToken, registrarAddress } =
    chainlinkAutomationSupportedNetworks.filter(
      (_) => _.chainId === chainId
    )[0];

  const link = m.getParameter("link", LINKToken);
  const registrar = m.getParameter("registrar", registrarAddress);

  const registerUpkeepContract = m.contract("RegisterUpkeep", [
    link,
    registrar,
  ]);

  return { registerUpkeepContract };
});

export default RegisterUpkeepModule;
