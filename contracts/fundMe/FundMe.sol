// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

error FundMe_NotEnoughFunds();

contract FundMe {
    uint immutable MIN_AMOUNT_IN_USD;
    address immutable PRICE_FEED_ADDRESS;
    int immutable s_priceFeedDecimals;
    AggregatorV3Interface internal s_dataFeed;

    constructor(
        uint _minAmountInUsd,
        address _priceFeedAddress,
        int _priceFeedDecimals
    ) {
        MIN_AMOUNT_IN_USD = _minAmountInUsd;
        PRICE_FEED_ADDRESS = _priceFeedAddress;
        s_priceFeedDecimals = _priceFeedDecimals;
        s_dataFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    function fund() external payable {
        if (msg.value < MIN_AMOUNT_IN_USD) revert FundMe_NotEnoughFunds();
    }

    function getMinAmountInUSD() external view returns (uint) {
        return MIN_AMOUNT_IN_USD;
    }

    function getPriceFeedAddress() external view returns (address) {
        return PRICE_FEED_ADDRESS;
    }

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }
}
