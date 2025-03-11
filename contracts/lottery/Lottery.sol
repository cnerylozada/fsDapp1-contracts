// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Lottery {
    address immutable s_owner;
    uint immutable s_prize;

    constructor(address _owner, uint _prize) {
        s_owner = _owner;
        s_prize = _prize;
    }

    function getOwner() external view returns (address) {
        return s_owner;
    }

    function getPrize() external view returns (uint) {
        return s_prize;
    }
}
