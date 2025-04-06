// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {Lottery} from "./Lottery.sol";

contract LotteryFactory {
    struct Detail {
        string _title;
        string _description;
        address _owner;
        uint _dateInSeconds;
        uint _numTickets;
        uint _ticketPrice;
        uint _prize;
    }
    event NewLottery(address indexed _address, uint _createdAt, Detail _detail);

    function createLottery(
        string memory _title,
        string memory _description,
        uint _numTickets,
        uint _dateInSeconds,
        uint _ticketPrice,
        address _vrfCoordinator,
        uint _subscriptionId,
        bytes32 _keyHash
    ) external payable {
        uint prize = msg.value;
        address owner = msg.sender;

        Lottery newLottery = new Lottery{value: prize}(
            owner,
            _dateInSeconds,
            _numTickets,
            _ticketPrice,
            _vrfCoordinator,
            _subscriptionId,
            _keyHash
        );
        address contractAddress = address(newLottery);

        Detail memory detail = Detail({
            _title: _title,
            _description: _description,
            _owner: owner,
            _dateInSeconds: _dateInSeconds,
            _numTickets: _numTickets,
            _ticketPrice: _ticketPrice,
            _prize: prize
        });
        emit NewLottery(contractAddress, block.timestamp, detail);
    }
}
