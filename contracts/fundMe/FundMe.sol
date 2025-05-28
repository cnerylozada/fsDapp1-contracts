// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {Utils} from "./Utils.sol";

error FundMe_NotEnoughFunds();
error FundMe_OnlyOwner();

contract FundMe {
    using Utils for uint;

    address private immutable s_owner;
    uint immutable MIN_AMOUNT_IN_USD;
    address immutable PRICE_FEED_ADDRESS;
    int immutable s_priceFeedDecimals;
    AggregatorV3Interface internal s_dataFeed;

    constructor(
        address _owner,
        uint _minAmountInUsd,
        address _priceFeedAddress,
        int _priceFeedDecimals
    ) {
        s_owner = _owner;
        MIN_AMOUNT_IN_USD = _minAmountInUsd;
        PRICE_FEED_ADDRESS = _priceFeedAddress;
        s_priceFeedDecimals = _priceFeedDecimals;
        s_dataFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    struct Funder {
        address walletAddress;
        uint amount;
        uint createdAt;
        bool wasItWithdrawn;
    }
    event NewFunder(Funder funder);
    Funder[] s_funders;

    function fund() external payable {
        uint fundToUSD = msg.value.convertETHToUSD(
            s_dataFeed,
            s_priceFeedDecimals
        );
        if (fundToUSD < MIN_AMOUNT_IN_USD) revert FundMe_NotEnoughFunds();

        Funder memory funder = Funder({
            walletAddress: msg.sender,
            amount: msg.value,
            createdAt: block.timestamp,
            wasItWithdrawn: false
        });
        emit NewFunder(funder);
        s_funders.push(funder);
    }

    function getFunders() external view returns (Funder[] memory) {
        return s_funders;
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

    function getPriceFeed() external view returns (uint) {
        return
            Utils.getChainlinkDataFeedLatestAnswer(s_dataFeed) /
            10 ** uint(s_priceFeedDecimals);
    }

    function getOwner() external view returns (address) {
        return s_owner;
    }

    modifier onlyOwner() {
        if (msg.sender != s_owner) revert FundMe_OnlyOwner();
        _;
    }

    function withdraw() external onlyOwner {
        uint contractBalance = address(this).balance;
        (bool sent, ) = payable(s_owner).call{value: contractBalance}("");
        if (!sent) revert();

        for (uint i = 0; i < s_funders.length; i++)
            if (!s_funders[i].wasItWithdrawn)
                s_funders[i].wasItWithdrawn = true;
    }
}
