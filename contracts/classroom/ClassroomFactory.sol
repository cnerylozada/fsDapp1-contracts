// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {Classroom} from "./Classroom.sol";

contract ClassroomFactory {
    event NewContractCreated(address contractAddress, string course);
    struct Medatada {
        address contractAddress;
        string course;
    }
    Medatada[] s_newContractCreated;
    mapping(address => string) s_addressToSessionId;

    function createClassroom(string calldata _course) external {
        Classroom classroomContract = new Classroom(_course);
        address newAddress = address(classroomContract);
        emit NewContractCreated(newAddress, _course);

        s_newContractCreated.push(
            Medatada({course: _course, contractAddress: newAddress})
        );
    }

    function contractsCreated() external view returns (Medatada[] memory) {
        return s_newContractCreated;
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
