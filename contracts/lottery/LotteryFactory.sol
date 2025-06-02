// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {Lottery} from "./Lottery.sol";

contract LotteryFactory {
    struct BaseMetadata {
        string title;
        string description;
        address owner;
        uint eventDate;
        uint numTickets;
        uint ticketPrice;
        uint prize;
    }
    event NewLottery(
        address indexed contractAddress,
        uint createdAt,
        BaseMetadata metadata
    );
    struct Metadata {
        address contractAddress;
        uint createdAt;
        BaseMetadata metadata;
    }
    Metadata[] s_createdContractList;

    function createLottery(
        string memory _title,
        string memory _description,
        uint _eventDate,
        uint _secondsToEvent,
        uint _numTickets,
        uint _ticketPrice,
        address _vrfCoordinator,
        uint _subscriptionId,
        bytes32 _keyHash
    ) external payable {
        uint prize = msg.value;
        address owner = msg.sender;

        Lottery newLottery = new Lottery{value: prize}(
            owner,
            _secondsToEvent,
            _numTickets,
            _ticketPrice,
            _vrfCoordinator,
            _subscriptionId,
            _keyHash
        );
        address contractAddress = address(newLottery);

        BaseMetadata memory baseMetadata = BaseMetadata({
            title: _title,
            description: _description,
            owner: owner,
            eventDate: _eventDate,
            numTickets: _numTickets,
            ticketPrice: _ticketPrice,
            prize: prize
        });
        uint createdAt = block.timestamp;
        emit NewLottery(contractAddress, createdAt, baseMetadata);
        s_createdContractList.push(
            Metadata({
                contractAddress: contractAddress,
                createdAt: createdAt,
                metadata: baseMetadata
            })
        );
    }

    function getCreatedContractList()
        external
        view
        returns (Metadata[] memory)
    {
        return s_createdContractList;
    }
}
