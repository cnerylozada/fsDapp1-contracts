// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract Lottery is VRFConsumerBaseV2Plus {
    error NotEnoughFund();
    error TicketsSoldOut();
    error LotteryNotAllowed();
    error RawLottery();

    enum LotteryState {
        INIT,
        PROCESSING,
        FINISHED
    }
    LotteryState s_state = LotteryState.INIT;

    address immutable i_owner;
    uint immutable i_prize;
    uint immutable i_numTickets;
    uint immutable i_ticketPrice;
    address[] s_participants;
    uint s_winnerIndex;

    bytes32 immutable s_keyHash;
    uint32 constant CALLBACK_GAS_LIMIT = 40000;
    uint16 constant REQUEST_CONFIRMATIONS = 3;
    uint32 constant NUM_WORDS = 1;
    uint private immutable s_subscriptionId;
    uint s_requestId;
    event RandomWord(uint _word);

    constructor(
        address _owner,
        uint _numTickets,
        uint _ticketPrice,
        address _vrfCoordinator,
        uint _subscriptionId,
        bytes32 _keyHash
    ) payable VRFConsumerBaseV2Plus(_vrfCoordinator) {
        i_owner = _owner;
        i_prize = msg.value;
        i_numTickets = _numTickets;
        i_ticketPrice = _ticketPrice;

        s_subscriptionId = _subscriptionId;
        s_keyHash = _keyHash;
    }

    function purchaseTicket() external payable {
        if (s_participants.length == i_numTickets) revert TicketsSoldOut();
        if (msg.value < i_ticketPrice) revert NotEnoughFund();
        if (s_state != LotteryState.INIT) revert LotteryNotAllowed();
        s_participants.push(msg.sender);
    }

    function requestWinner() public returns (uint256 requestId) {
        if (s_state != LotteryState.INIT) revert LotteryNotAllowed();
        s_state = LotteryState.PROCESSING;
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );
        s_requestId = requestId;
    }

    function fulfillRandomWords(
        uint256 /*requestId*/,
        uint256[] calldata randomWords
    ) internal override {
        s_winnerIndex = randomWords[0] % i_numTickets;
        s_state = LotteryState.FINISHED;
        emit RandomWord(randomWords[0]);
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

    function getWinnerAddress() external view returns (address) {
        if (s_state == LotteryState.INIT) revert RawLottery();
        if (s_state == LotteryState.PROCESSING) revert LotteryNotAllowed();
        return
            s_winnerIndex < s_participants.length
                ? s_participants[s_winnerIndex]
                : address(0);
    }

    function getRequestId() external view returns (uint) {
        return s_requestId;
    }

    function getState() external view returns (LotteryState) {
        return s_state;
    }
}
