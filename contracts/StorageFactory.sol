// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {Storage} from "./storage/Storage.sol";

contract StorageFactory {
    uint s_currentIndex = 0;
    mapping(uint => address) s_indexToAddress;

    function createStorage(string calldata _course) external {
        Storage storageContract = new Storage(_course);
        s_indexToAddress[s_currentIndex] = address(storageContract);
        s_currentIndex++;
    }
}
