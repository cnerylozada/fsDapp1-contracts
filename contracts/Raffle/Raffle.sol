// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Raffle {
    uint private raffleIterator = 0;
    mapping(uint => address) public mapRaffleIdToOwner;
    mapping(uint => uint[]) public mapRaffleToParticipants;

    function createRaffle() public {
        mapRaffleIdToOwner[raffleIterator] = msg.sender;
        ++raffleIterator;
    }

    function addNewParticipantByRaffleId(
        uint raffleId,
        uint participantId
    ) public {
        mapRaffleToParticipants[raffleId].push(participantId);
    }

    function startRaffleById() public {}
}
