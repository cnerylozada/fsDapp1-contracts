// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {Classroom} from "./Classroom.sol";

contract ClassroomFactory {
    event NewContractCreated(address contractAddress, string course);
    struct Medatada {
        address contractAddress;
        uint256 createdAt;
        string course;
    }
    Medatada[] s_createdContractList;
    mapping(address => string) s_addressToSessionId;

    function createClassroom(string calldata _course) external {
        uint createdAt = block.timestamp;
        Classroom classroomContract = new Classroom(_course, createdAt);
        address newAddress = address(classroomContract);
        emit NewContractCreated(newAddress, _course);

        s_createdContractList.push(
            Medatada({
                course: _course,
                createdAt: createdAt,
                contractAddress: newAddress
            })
        );
    }

    function getCreatedContractList()
        external
        view
        returns (Medatada[] memory)
    {
        return s_createdContractList;
    }

    function assingSessionIdToWalletAddress(
        address _walletAddress,
        string memory _sessionId
    ) external {
        s_addressToSessionId[_walletAddress] = _sessionId;
    }

    function getSessionIdByWalletAddress(
        address _walletAddress
    ) external view returns (string memory) {
        return s_addressToSessionId[_walletAddress];
    }
}
