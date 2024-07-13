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
        uint feeInETH;
        uint secondsToStart;
        uint numberOfTickets;
        RaffleState state;
    }
}
