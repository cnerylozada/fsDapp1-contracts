// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Lottery {
    address immutable i_owner;
    uint immutable i_prize;
    uint immutable i_numTickets;
    uint immutable i_ticketPrice;

    constructor(address _owner, uint _numTickets, uint _ticketPrice) payable {
        i_owner = _owner;
        i_prize = msg.value;
        i_numTickets = _numTickets;
        i_ticketPrice = _ticketPrice;
    }

    function purchaseTicket() external payable {}

    function getOwner() external view returns (address) {
        return i_owner;
    }

    function getPrize() external view returns (uint) {
        return i_prize;
    }
}
