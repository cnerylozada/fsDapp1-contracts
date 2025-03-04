// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {Storage} from "./storage/Storage.sol";

contract StorageFactory {
    address[] private s_contractAddresses;

    function createStorage(string calldata _course) external returns (address) {
        Storage storageContract = new Storage(_course);
        address newAddress = address(storageContract);
        s_contractAddresses.push(newAddress);
        return newAddress;
    }

    function getAddressList() external view returns (address[] memory) {
        return s_contractAddresses;
    }
}
