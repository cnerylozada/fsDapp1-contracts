// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract Lottery is VRFConsumerBaseV2Plus, AutomationCompatibleInterface {
    error NotEnoughFund();
    error TicketsSoldOut();
    error LotteryNotAvailable();

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
    uint immutable i_secondsToEvent;

    address[] s_participants;
    uint s_winnerIndex;

    bytes32 immutable s_keyHash;
    uint32 constant CALLBACK_GAS_LIMIT = 100000;
    uint16 constant REQUEST_CONFIRMATIONS = 3;
    uint32 constant NUM_WORDS = 1;
    uint private immutable s_subscriptionId;
    uint s_requestId;
    event Winner(uint _index, address _address);

    constructor(
        address _owner,
        uint _secondsToEvent,
        uint _numTickets,
        uint _ticketPrice,
        address _vrfCoordinator,
        uint _subscriptionId,
        bytes32 _keyHash
    ) payable VRFConsumerBaseV2Plus(_vrfCoordinator) {
        i_owner = _owner;
        i_secondsToEvent = block.timestamp + _secondsToEvent;
        i_numTickets = _numTickets;
        i_ticketPrice = _ticketPrice;
        i_prize = msg.value;

        s_subscriptionId = _subscriptionId;
        s_keyHash = _keyHash;
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        bool isInitialState = s_state == LotteryState.INIT;
        upkeepNeeded = isInitialState && block.timestamp > i_secondsToEvent;
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        LotteryState state = s_state;
        bool isInitialState = state == LotteryState.INIT;
        bool upkeepNeeded = isInitialState &&
            block.timestamp > i_secondsToEvent;
        if (!upkeepNeeded) revert();

        if (state != LotteryState.INIT) revert LotteryNotAvailable();
        s_state = LotteryState.PROCESSING;
        uint requestId = s_vrfCoordinator.requestRandomWords(
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

    function purchaseTicket() external payable {
        if (s_participants.length == i_numTickets) revert TicketsSoldOut();
        if (msg.value < i_ticketPrice) revert NotEnoughFund();
        if (s_state != LotteryState.INIT) revert LotteryNotAvailable();
        s_participants.push(msg.sender);
    }

    function fulfillRandomWords(
        uint256 /*requestId*/,
        uint256[] calldata randomWords
    ) internal override {
        s_winnerIndex = randomWords[0] % i_numTickets;
        s_state = LotteryState.FINISHED;
        reward(s_winnerIndex);
    }

    function reward(uint _winnerIndex) internal {
        address[] memory participants = s_participants;
        if (_winnerIndex < participants.length) {
            address winnerAddress = participants[_winnerIndex];
            (bool callSuccess, ) = payable(winnerAddress).call{value: i_prize}(
                ""
            );
            require(callSuccess, "Call failed");
            emit Winner(_winnerIndex, winnerAddress);
        } else emit Winner(_winnerIndex, address(0));
    }

    function getWinnerAddress() external view returns (address) {
        return
            s_state == LotteryState.FINISHED &&
                s_winnerIndex < s_participants.length
                ? s_participants[s_winnerIndex]
                : address(0);
    }

    function getOwner() external view returns (address) {
        return i_owner;
    }

    function getNumTickets() external view returns (uint) {
        return i_numTickets;
    }

    function getPrize() external view returns (uint) {
        return i_prize;
    }

    function getParticipants() external view returns (address[] memory) {
        return s_participants;
    }

    function getState() external view returns (LotteryState) {
        return s_state;
    }

    function getRequestId() external view returns (uint) {
        return s_requestId;
    }
}
