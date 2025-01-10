import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const StorageFactoryModule = buildModule("StorageFactoryModule", (m) => {
  const storageFactoryContract = m.contract("StorageFactory");
  return { storageFactoryContract };
});

export default StorageFactoryModule;
