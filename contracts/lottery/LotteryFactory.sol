// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {Lottery} from "./Lottery.sol";

contract LotteryFactory {
    event NewLottery(
        address _owner,
        address indexed _address,
        uint _createdAt,
        string _title,
        uint _prize,
        string _description,
        uint _numTickets,
        uint _ticketPrice
    );

    function createLottery(
        string memory _title,
        string memory _description,
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
            _numTickets,
            _ticketPrice,
            _vrfCoordinator,
            _subscriptionId,
            _keyHash
        );
        address contractAddress = address(newLottery);

        emit NewLottery(
            owner,
            contractAddress,
            block.timestamp,
            _title,
            prize,
            _description,
            _numTickets,
            _ticketPrice
        );
    }
}
