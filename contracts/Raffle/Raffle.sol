// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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
    address public vrfCoordinator = 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;
    uint256 public s_subscriptionId;
    bytes32 private s_keyHash =
        0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
    uint32 private callbackGasLimit = 40000;
    uint16 private requestConfirmations = 3;
    uint32 private numWords = 1;

    uint private raffleIterator = 0;
    mapping(uint => address) public mapRaffleIdToOwner;
    mapping(uint => address[]) public mapRaffleIdToParticipants;
    mapping(uint => uint) public mapRequestIdToRaffleId;
    mapping(uint => uint) public mapRaffleIdToRawWinner;
    uint public immutable MAX_NUM_PARTICIPANTS = 5;

    constructor(uint256 subscriptionId) VRFConsumerBaseV2Plus(vrfCoordinator) {
        s_subscriptionId = subscriptionId;
    }

    function createRaffle() public {
        mapRaffleIdToOwner[raffleIterator] = msg.sender;
        ++raffleIterator;
    }

    function addNewParticipantByRaffleId(uint raffleId) public {
        if (mapRaffleIdToOwner[raffleId] == address(0))
            revert Raffle__NoCreated(raffleId);
        mapRaffleIdToParticipants[raffleId].push(msg.sender);
    }

    function startRaffleById(uint raffleId) public {
        if (mapRaffleIdToOwner[raffleId] == msg.sender)
            revert Raffle__OnlyOwner(raffleId);
        if (mapRaffleIdToParticipants[raffleId].length == 0)
            revert Raffle__NoParticipantsCreated(raffleId);
        if (mapRaffleIdToRawWinner[raffleId] != 0)
            revert Raffle__RandomAlreadyCalled(raffleId);
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );
        mapRequestIdToRaffleId[requestId] = raffleId;
        mapRaffleIdToRawWinner[raffleId] = MAX_NUM_PARTICIPANTS + 1;
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint raffleId = mapRequestIdToRaffleId[requestId];
        address[] memory participants = mapRaffleIdToParticipants[raffleId];
        mapRaffleIdToRawWinner[raffleId] =
            (randomWords[0] % participants.length) +
            1;
    }

    function getWinnerByRaffleId(uint raffleId) public view returns (address) {
        if (mapRaffleIdToRawWinner[raffleId] == 0)
            revert Raffle__RandomNotCalled(raffleId);
        if (mapRaffleIdToRawWinner[raffleId] > MAX_NUM_PARTICIPANTS)
            revert Raffle__RandomInProgress();
        address[] memory participants = mapRaffleIdToParticipants[raffleId];
        uint winnerIdex = mapRaffleIdToRawWinner[raffleId] - 1;
        return participants[winnerIdex];
    }
}
