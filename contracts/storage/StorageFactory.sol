// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {Storage} from "./Storage.sol";

contract StorageFactory {
    address[] private s_contractAddresses;

    event NewContractCreated(address _address, string _course);
    struct Medatada {
        address _address;
        string _course;
    }
    Medatada[] s_newContractCreated;

    function getAddressList() external view returns (address[] memory) {
        return s_contractAddresses;
    }

    function createStorage(string calldata _course) external {
        Storage storageContract = new Storage(_course);
        address newAddress = address(storageContract);
        emit NewContractCreated(newAddress, _course);
        s_contractAddresses.push(newAddress);

        s_newContractCreated.push(
            Medatada({_course: _course, _address: newAddress})
        );
    }

    function contractsCreated() external view returns (Medatada[] memory) {
        return s_newContractCreated;
    }
}
