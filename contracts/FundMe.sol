// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract FundMe {
    uint immutable MIN_AMOUNT_IN_USD;

    constructor(uint _minAmountInUsd) {
        MIN_AMOUNT_IN_USD = _minAmountInUsd;
    }

    function fund() external payable {}

    function getMinAmountInUSD() external view returns (uint) {
        return MIN_AMOUNT_IN_USD;
    }
}
