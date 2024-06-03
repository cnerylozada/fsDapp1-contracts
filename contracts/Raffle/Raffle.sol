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
error Raffle__MaxNumParticipants();

contract Raffle is VRFConsumerBaseV2Plus {
    uint16 private immutable REQUEST_CONFIRMATIONS = 3;
    uint32 private immutable NUM_WORDS = 1;
    uint public immutable MAX_NUM_PARTICIPANTS = 7;

    uint256 public s_subscriptionId;
    bytes32 private s_keyHash;
    uint32 private s_callbackGasLimit;

    uint private s_raffleIterator = 0;
    mapping(uint => address) public s_ownersByRaffleId;
    mapping(uint => address[]) public s_participantsByRaffleId;
    mapping(uint => uint) public s_raffleIdByRequestId;
    mapping(uint => uint) public s_rawWinnersByRaffleId;

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

    function createRaffle() public {
        s_ownersByRaffleId[s_raffleIterator] = msg.sender;
        ++s_raffleIterator;
    }

    function addNewParticipantByRaffleId(uint raffleId) public {
        if (s_ownersByRaffleId[raffleId] == address(0))
            revert Raffle__NoCreated(raffleId);
        s_participantsByRaffleId[raffleId].push(msg.sender);
    }

    function startRaffleById(uint raffleId) public {
        if (s_ownersByRaffleId[raffleId] == msg.sender)
            revert Raffle__OnlyOwner(raffleId);
        if (s_participantsByRaffleId[raffleId].length == 0)
            revert Raffle__NoParticipantsCreated(raffleId);
        if (s_rawWinnersByRaffleId[raffleId] != 0)
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
        s_raffleIdByRequestId[requestId] = raffleId;
        s_rawWinnersByRaffleId[raffleId] = MAX_NUM_PARTICIPANTS + 1;
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        uint raffleId = s_raffleIdByRequestId[requestId];
        address[] memory participants = s_participantsByRaffleId[raffleId];
        s_rawWinnersByRaffleId[raffleId] =
            (randomWords[0] % participants.length) +
            1;
    }

    function getWinnerByRaffleId(uint raffleId) public view returns (address) {
        if (s_rawWinnersByRaffleId[raffleId] == 0)
            revert Raffle__RandomNotCalled(raffleId);
        if (s_rawWinnersByRaffleId[raffleId] > MAX_NUM_PARTICIPANTS)
            revert Raffle__RandomInProgress();
        address[] memory participants = s_participantsByRaffleId[raffleId];
        uint winnerIdex = s_rawWinnersByRaffleId[raffleId] - 1;
        return participants[winnerIdex];
    }
}
