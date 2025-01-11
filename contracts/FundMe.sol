// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

error FundMe_NotEnoughFunds();

contract FundMe {
    uint immutable MIN_AMOUNT_IN_USD;
    AggregatorV3Interface internal dataFeed;

    constructor(uint _minAmountInUsd, address _priceFeedAddress) {
        MIN_AMOUNT_IN_USD = _minAmountInUsd;
        dataFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    function fund() external payable {
        if (msg.value < MIN_AMOUNT_IN_USD) revert FundMe_NotEnoughFunds();
    }

    function getMinAmountInUSD() external view returns (uint) {
        return MIN_AMOUNT_IN_USD;
    }

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }
}
