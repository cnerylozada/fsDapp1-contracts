// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {Storage} from "./Storage.sol";

contract StorageFactory {
    event NewContractCreated(address contractAddress, string course);
    struct Medatada {
        address contractAddress;
        string course;
    }
    Medatada[] s_newContractCreated;

    function createStorage(string calldata _course) external {
        Storage storageContract = new Storage(_course);
        address newAddress = address(storageContract);
        emit NewContractCreated(newAddress, _course);

        s_newContractCreated.push(
            Medatada({course: _course, contractAddress: newAddress})
        );
    }

    function contractsCreated() external view returns (Medatada[] memory) {
        return s_newContractCreated;
    }
}
