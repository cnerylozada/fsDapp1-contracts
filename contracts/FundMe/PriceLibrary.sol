// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceLibrary {
    function getPrice(
        AggregatorV3Interface dataFeed
    ) internal view returns (uint256) {
        (, int256 answer, , , ) = dataFeed.latestRoundData();
        return uint256(answer);
    }

    function convertAmountInUSD(
        uint256 clientValue,
        AggregatorV3Interface dataFeed
    ) internal view returns (uint256) {
        uint256 rawAmountInUSD = (clientValue * getPrice(dataFeed)) / 1e18;
        return rawAmountInUSD / 1e8;
    }
}
