// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library Utils {
    function getChainlinkDataFeedLatestAnswer(
        AggregatorV3Interface _dataFeed
    ) internal view returns (uint) {
        (, int answer, , , ) = _dataFeed.latestRoundData();
        return uint(answer);
    }

    function convertETHToUSD(
        uint _amount,
        AggregatorV3Interface _dataFeed,
        int _priceFeedDecimals
    ) internal view returns (uint) {
        uint rawUSDAmount = (_amount *
            getChainlinkDataFeedLatestAnswer(_dataFeed)) / 1e18;
        return rawUSDAmount / 10 ** uint(_priceFeedDecimals);
    }
}
