// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Lottery {
    address immutable i_owner;
    uint immutable i_prize;
    uint immutable i_numTickets;
    uint immutable i_ticketPrice;
    address[] s_participants;

    error NotEnoughFund();
    error TicketsSoldOut();

    constructor(address _owner, uint _numTickets, uint _ticketPrice) payable {
        i_owner = _owner;
        i_prize = msg.value;
        i_numTickets = _numTickets;
        i_ticketPrice = _ticketPrice;
    }

    function purchaseTicket() external payable {
        if (s_participants.length == i_numTickets) revert TicketsSoldOut();
        if (msg.value < i_ticketPrice) revert NotEnoughFund();
        s_participants.push(msg.sender);
    }

    function getOwner() external view returns (address) {
        return i_owner;
    }

    function getPrize() external view returns (uint) {
        return i_prize;
    }

    function getParticipants() external view returns (address[] memory) {
        return s_participants;
    }
}
