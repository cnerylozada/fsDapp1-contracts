// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

error Raffle__NoCreated(uint raffleId);
error Raffle__OnlyOwner(uint raffleId);
error Raffle__NoParticipantsCreated(uint raffleId);
error Raffle__RandomNotCalled(uint raffleId);
error Raffle__RandomAlreadyCalled(uint raffleId);
error Raffle__RandomInProgress();
error Raffle__MaxNumParticipants(uint raffleId);
error Raffle__SendMoreToEnterRaffle();

contract MultiRaffle is VRFConsumerBaseV2Plus {
    uint16 private immutable REQUEST_CONFIRMATIONS = 3;
    uint32 private immutable NUM_WORDS = 1;
    uint public immutable MAX_NUM_PARTICIPANTS = 3;

    uint256 private s_subscriptionId;
    bytes32 private s_keyHash;
    uint32 private s_callbackGasLimit;

    uint private s_raffleIterator = 0;
    struct Raffle {
        uint feeInETH;
        uint id;
        uint secondsToStart;
    }
    mapping(uint => address) public s_raffleIdToOwner;
    mapping(uint => Raffle) private s_raffleIdToRaffleDetail;
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

    function createRaffle(uint _secondsToStart, uint _feeInETH) external {
        uint currentIterator = s_raffleIterator;
        s_raffleIdToOwner[currentIterator] = msg.sender;
        s_raffleIdToRaffleDetail[currentIterator] = Raffle({
            id: currentIterator,
            feeInETH: _feeInETH,
            secondsToStart: _secondsToStart
        });
        currentIterator = currentIterator + 1;
        s_raffleIterator = currentIterator;
    }

    function addNewParticipantByRaffleId(uint raffleId) external payable {
        if (s_raffleIdToOwner[raffleId] == address(0))
            revert Raffle__NoCreated(raffleId);
        uint numParticipants = s_raffleIdToParticipants[raffleId].length;
        if (numParticipants == MAX_NUM_PARTICIPANTS)
            revert Raffle__MaxNumParticipants(raffleId);
        if (s_raffleIdToWinnerIndex[raffleId] > MAX_NUM_PARTICIPANTS)
            revert Raffle__RandomInProgress();
        Raffle memory raffle = s_raffleIdToRaffleDetail[raffleId];
        if (raffle.feeInETH > msg.value) revert Raffle__SendMoreToEnterRaffle();
        s_raffleIdToParticipants[raffleId].push(payable(msg.sender));
    }

    function startRaffleById(uint raffleId) external {
        if (s_raffleIdToOwner[raffleId] == address(0))
            revert Raffle__NoCreated(raffleId);
        if (s_raffleIdToParticipants[raffleId].length == 0)
            revert Raffle__NoParticipantsCreated(raffleId);
        if (s_raffleIdToOwner[raffleId] != msg.sender)
            revert Raffle__OnlyOwner(raffleId);
        if (s_raffleIdToWinnerIndex[raffleId] != 0)
            revert Raffle__RandomAlreadyCalled(raffleId);

        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: s_callbackGasLimit,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );
        s_requestIdToRaffleId[requestId] = raffleId;
        s_raffleIdToWinnerIndex[raffleId] = MAX_NUM_PARTICIPANTS + 1;
        emit RequestIdByRaffleId(raffleId, requestId);
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

    function awardWinnerByRafleId(uint raffleId, uint winnerIndex) private {
        address payable[] memory participants = s_raffleIdToParticipants[
            raffleId
        ];
        address payable winner = participants[winnerIndex];

        Raffle memory raffle = s_raffleIdToRaffleDetail[raffleId];
        uint prize = raffle.feeInETH * participants.length;
        (bool callSuccess, ) = winner.call{value: prize}("");
        require(callSuccess, "Call failed");
        emit WinnerPickedByRaffleId(raffleId, winner);
    }

    function getWinnerByRaffleId(
        uint raffleId
    ) external view returns (address) {
        if (s_raffleIdToOwner[raffleId] == address(0))
            revert Raffle__NoCreated(raffleId);
        if (s_raffleIdToWinnerIndex[raffleId] == 0)
            revert Raffle__RandomNotCalled(raffleId);
        if (s_raffleIdToWinnerIndex[raffleId] > MAX_NUM_PARTICIPANTS)
            revert Raffle__RandomInProgress();

        address payable[] memory participants = s_raffleIdToParticipants[
            raffleId
        ];
        uint winnerIndex = s_raffleIdToWinnerIndex[raffleId];
        return participants[winnerIndex];
    }
}
