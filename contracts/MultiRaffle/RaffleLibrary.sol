// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library RaffleLibrary {
    uint16 internal constant REQUEST_CONFIRMATIONS = 3;
    uint32 internal constant NUM_WORDS = 1;
    uint internal constant MAX_NUM_PARTICIPANTS = 7;

    enum RaffleState {
        OPEN,
        CALCULATING,
        CLOSED,
        CANCELLED
    }

    struct Raffle {
        uint id;
        address owner;
        uint feeInETH;
        uint numberOfTickets;
        RaffleState state;
        uint lastTimeStamp;
        uint secondsToStart;
    }

    // function searchRaffleById(
    //     uint256 _raffleId,
    //     Raffle[] memory _raffleList
    // ) public pure returns (Raffle memory) {
    //     Raffle memory raffle;
    //     for (uint256 i = 0; i < _raffleList.length; i++) {
    //         Raffle memory raffleItem = _raffleList[i];
    //         if (raffleItem.id == _raffleId) raffle = raffleItem;
    //     }
    //     return raffle;
    // }
}
