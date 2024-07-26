// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

import {RaffleLibrary} from "./RaffleLibrary.sol";

error Raffle__NoCreated(uint raffleId);
error Raffle__OnlyOwner(uint raffleId);
error Raffle__NoParticipantsCreated(uint raffleId);
error Raffle__RandomNotCalled(uint raffleId);
error Raffle__RandomInProgress();
error Raffle__MaxNumParticipants();
error Raffle__SendMoreToEnterRaffle();
error Raffle_NotAvailable();

contract MultiRaffle is VRFConsumerBaseV2Plus, AutomationCompatibleInterface {
    function searchRaffleById(
        uint256 _raffleId,
        RaffleLibrary.Raffle[] memory _raffleList
    ) public pure returns (RaffleLibrary.Raffle memory) {
        RaffleLibrary.Raffle memory raffle;
        for (uint256 i = 0; i < _raffleList.length; i++) {
            RaffleLibrary.Raffle memory raffleItem = _raffleList[i];
            if (raffleItem.id == _raffleId) raffle = raffleItem;
        }
        return raffle;
    }

    uint private s_subscriptionId;
    bytes32 private s_keyHash;
    uint32 private s_callbackGasLimit;

    RaffleLibrary.Raffle[] public s_raffleDetailList;
    mapping(uint => address payable[]) public s_raffleIdToParticipants;
    mapping(uint => uint) private s_requestIdToRaffleId;
    mapping(uint => uint) private s_raffleIdToWinnerIndex;

    event RequestIdByRaffleId(uint raffleId, uint requestId);
    event WinnerPickedByRaffleId(uint raffleId, address winner);

    constructor(
        uint subscriptionId,
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

        uint raffleSize = s_raffleDetailList.length;
        RaffleLibrary.Raffle memory newRaffle = RaffleLibrary.Raffle({
            id: raffleSize + 1,
            owner: msg.sender,
            feeInETH: _feeInETH,
            state: RaffleLibrary.RaffleState.OPEN,
            numberOfTickets: _numberOfTickets,
            lastTimeStamp: block.timestamp,
            secondsToStart: _secondsToStart
        });
        s_raffleDetailList.push(newRaffle);
    }

    function purchaseTicketByRaffleId(uint _raffleId) external payable {
        RaffleLibrary.Raffle memory raffle = searchRaffleById(
            _raffleId,
            s_raffleDetailList
        );
        if (raffle.id == 0) revert Raffle__NoCreated(_raffleId);

        if (raffle.state != RaffleLibrary.RaffleState.OPEN)
            revert Raffle_NotAvailable();
        if (raffle.feeInETH > msg.value) revert Raffle__SendMoreToEnterRaffle();

        uint numParticipants = s_raffleIdToParticipants[_raffleId].length;
        if (numParticipants == raffle.numberOfTickets)
            revert Raffle__MaxNumParticipants();

        s_raffleIdToParticipants[_raffleId].push(payable(msg.sender));
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        uint counter;
        for (uint i = 0; i < s_raffleDetailList.length; i++) {
            RaffleLibrary.Raffle memory raffleItem = s_raffleDetailList[i];
            if (
                (raffleItem.state == RaffleLibrary.RaffleState.OPEN) &&
                (block.timestamp - raffleItem.lastTimeStamp >
                    raffleItem.secondsToStart)
            ) {
                counter = counter + 1;
            }
        }

        uint[] memory raffleIndexes = new uint[](counter);
        uint indexCounter;
        upkeepNeeded = false;
        for (uint i = 0; i < s_raffleDetailList.length; i++) {
            RaffleLibrary.Raffle memory raffleItem = s_raffleDetailList[i];
            if (
                (raffleItem.state == RaffleLibrary.RaffleState.OPEN) &&
                (block.timestamp - raffleItem.lastTimeStamp >
                    raffleItem.secondsToStart)
            ) {
                upkeepNeeded = true;
                raffleIndexes[indexCounter] = i;
                indexCounter = indexCounter + 1;
            }
        }
        performData = abi.encode(raffleIndexes);
        return (upkeepNeeded, performData);
    }

    function performUpkeep(bytes calldata performData) external override {
        uint256[] memory raffleIndexes = abi.decode(performData, (uint256[]));

        for (uint i = 0; i < raffleIndexes.length; i++) {
            uint raffleId = raffleIndexes[i];
            RaffleLibrary.Raffle memory raffle = s_raffleDetailList[raffleId];
            uint requestId = s_vrfCoordinator.requestRandomWords(
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
            s_requestIdToRaffleId[requestId] = raffleId;

            raffle.state = RaffleLibrary.RaffleState.CALCULATING;
            s_raffleDetailList[raffleId] = raffle;
            emit RequestIdByRaffleId(raffleId, requestId);
        }
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
        RaffleLibrary.Raffle memory raffle = s_raffleDetailList[_raffleId];
        raffle.state = RaffleLibrary.RaffleState.CLOSED;
        s_raffleDetailList[_raffleId] = raffle;

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
        RaffleLibrary.Raffle memory raffle = searchRaffleById(
            _raffleId,
            s_raffleDetailList
        );
        if (raffle.id == 0) revert Raffle__NoCreated(_raffleId);

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
