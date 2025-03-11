// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {Lottery} from "./Lottery.sol";

contract LotteryFactory {
    event NewLottery(
        address _owner,
        address _address,
        string _title,
        string _description,
        uint _prize,
        uint _createdAt
    );

    function createLottery(
        string calldata _title,
        string calldata _description,
        uint _prize
    ) external {
        address owner = msg.sender;
        Lottery newLottery = new Lottery(owner, _prize);
        address contractAddress = address(newLottery);
        emit NewLottery(
            owner,
            contractAddress,
            _title,
            _description,
            _prize,
            block.timestamp
        );
    }
}
