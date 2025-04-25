import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MerkleModule = buildModule("MerkleModule", (m) => {
  const owner = m.getAccount(0);
  const merkleContract = m.contract("Merkle", [owner]);

  return { merkleContract };
});

export default MerkleModule;
