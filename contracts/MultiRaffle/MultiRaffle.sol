// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

import {RaffleLibrary} from "./RaffleLibrary.sol";

error Raffle__NoCreated(uint raffleId);
error Raffle__OnlyOwner(uint raffleId);
error Raffle__NoParticipantsCreated(uint raffleId);
error Raffle__RandomNotCalled(uint raffleId);
error Raffle__RandomInProgress();
error Raffle__MaxNumParticipants();
error Raffle__SendMoreToEnterRaffle();
error Raffle_NotAvailable();

contract MultiRaffle is VRFConsumerBaseV2Plus {
    uint256 private s_subscriptionId;
    bytes32 private s_keyHash;
    uint32 private s_callbackGasLimit;

    uint private s_raffleIterator = 1;
    mapping(uint => address) public s_raffleIdToOwner;
    mapping(uint => RaffleLibrary.Raffle) private s_raffleIdToRaffleDetail;
    mapping(uint => address payable[]) public s_raffleIdToParticipants;
    mapping(uint => uint) private s_requestIdToRaffleId;
    mapping(uint => uint) private s_raffleIdToWinnerIndex;

    event RequestIdByRaffleId(uint raffleId, uint requestId);
    event WinnerPickedByRaffleId(uint raffleId, address winner);

    constructor(
        uint256 subscriptionId,
        address vrfCoordinator,
        bytes32 keyHash,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        s_subscriptionId = subscriptionId;
        s_keyHash = keyHash;
        s_callbackGasLimit = callbackGasLimit;
    }

    function createRaffle(
        uint _secondsToStart,
        uint _feeInETH,
        uint _numberOfTickets
    ) external {
        if (_numberOfTickets > RaffleLibrary.MAX_NUM_PARTICIPANTS)
            revert Raffle__MaxNumParticipants();

        uint currentIterator = s_raffleIterator;
        s_raffleIdToOwner[currentIterator] = msg.sender;
        s_raffleIdToRaffleDetail[currentIterator] = RaffleLibrary.Raffle({
            id: currentIterator,
            feeInETH: _feeInETH,
            secondsToStart: _secondsToStart,
            state: RaffleLibrary.RaffleState.OPEN,
            numberOfTickets: _numberOfTickets
        });
        s_raffleIterator = currentIterator + 1;
    }

    function purchaseTicketByRaffleId(uint _raffleId) external payable {
        if (s_raffleIdToOwner[_raffleId] == address(0))
            revert Raffle__NoCreated(_raffleId);

        RaffleLibrary.Raffle memory raffleDetail = s_raffleIdToRaffleDetail[
            _raffleId
        ];
        if (raffleDetail.state != RaffleLibrary.RaffleState.OPEN)
            revert Raffle_NotAvailable();
        if (raffleDetail.feeInETH > msg.value)
            revert Raffle__SendMoreToEnterRaffle();

        uint numParticipants = s_raffleIdToParticipants[_raffleId].length;
        if (numParticipants == raffleDetail.numberOfTickets)
            revert Raffle__MaxNumParticipants();

        s_raffleIdToParticipants[_raffleId].push(payable(msg.sender));
    }

    function startRaffleById(uint _raffleId) external {
        if (s_raffleIdToOwner[_raffleId] == address(0))
            revert Raffle__NoCreated(_raffleId);
        if (s_raffleIdToParticipants[_raffleId].length == 0)
            revert Raffle__NoParticipantsCreated(_raffleId);
        if (s_raffleIdToOwner[_raffleId] != msg.sender)
            revert Raffle__OnlyOwner(_raffleId);

        RaffleLibrary.Raffle memory raffle = s_raffleIdToRaffleDetail[
            _raffleId
        ];
        if (raffle.state != RaffleLibrary.RaffleState.OPEN)
            revert Raffle_NotAvailable();

        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: RaffleLibrary.REQUEST_CONFIRMATIONS,
                callbackGasLimit: s_callbackGasLimit,
                numWords: RaffleLibrary.NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );
        s_requestIdToRaffleId[requestId] = _raffleId;

        raffle.state = RaffleLibrary.RaffleState.CALCULATING;
        s_raffleIdToRaffleDetail[_raffleId] = raffle;
        emit RequestIdByRaffleId(_raffleId, requestId);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        uint raffleId = s_requestIdToRaffleId[requestId];
        address payable[] memory participants = s_raffleIdToParticipants[
            raffleId
        ];
        s_raffleIdToWinnerIndex[raffleId] = (randomWords[0] %
            participants.length);
        awardWinnerByRafleId(raffleId, s_raffleIdToWinnerIndex[raffleId]);
    }

    function awardWinnerByRafleId(uint _raffleId, uint _winnerIndex) private {
        RaffleLibrary.Raffle memory raffle = s_raffleIdToRaffleDetail[
            _raffleId
        ];
        raffle.state = RaffleLibrary.RaffleState.CLOSED;
        s_raffleIdToRaffleDetail[_raffleId] = raffle;

        address payable[] memory participants = s_raffleIdToParticipants[
            _raffleId
        ];
        address payable winner = participants[_winnerIndex];
        uint prize = raffle.feeInETH * participants.length;
        (bool callSuccess, ) = winner.call{value: prize}("");
        require(callSuccess, "Call failed");
        emit WinnerPickedByRaffleId(_raffleId, winner);
    }

    function getWinnerByRaffleId(
        uint _raffleId
    ) external view returns (address) {
        if (s_raffleIdToOwner[_raffleId] == address(0))
            revert Raffle__NoCreated(_raffleId);

        RaffleLibrary.Raffle memory raffle = s_raffleIdToRaffleDetail[
            _raffleId
        ];

        if (raffle.state == RaffleLibrary.RaffleState.OPEN)
            revert Raffle__RandomNotCalled(_raffleId);

        if (raffle.state == RaffleLibrary.RaffleState.CALCULATING)
            revert Raffle__RandomInProgress();

        address payable[] memory participants = s_raffleIdToParticipants[
            _raffleId
        ];
        uint winnerIndex = s_raffleIdToWinnerIndex[_raffleId];
        return participants[winnerIndex];
    }
}
