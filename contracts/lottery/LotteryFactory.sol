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
        string calldata _title,
        string calldata _description,
        uint _numTickets,
        uint _ticketPrice
    ) external payable {
        uint prize = msg.value;
        address owner = msg.sender;
        Lottery newLottery = new Lottery{value: prize}(
            owner,
            _numTickets,
            _ticketPrice
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
