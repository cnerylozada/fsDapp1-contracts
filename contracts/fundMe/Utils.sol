// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library Utils {
    function getChainlinkDataFeedLatestAnswer(
        AggregatorV3Interface _dataFeed
    ) internal view returns (int) {
        (, int answer, , , ) = _dataFeed.latestRoundData();
        return answer;
    }
}
