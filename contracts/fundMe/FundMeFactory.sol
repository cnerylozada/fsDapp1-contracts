// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {FundMe} from "./FundMe.sol";

contract FundMeFactory {
    event NewCrowdFunding(
        address indexed _address,
        uint _createdAt,
        string _title,
        string _description,
        uint _minAmountInUsd,
        address _priceFeedAddress,
        int _priceFeedDecimals
    );

    function createNewCrowdFunding(
        string calldata _title,
        string calldata _description,
        uint _minAmountInUsd,
        address _priceFeedAddress,
        int _priceFeedDecimals
    ) external {
        FundMe fundMe = new FundMe(
            msg.sender,
            _minAmountInUsd,
            _priceFeedAddress,
            _priceFeedDecimals
        );
        uint createdAt = block.timestamp;
        address contractAddress = address(fundMe);
        emit NewCrowdFunding(
            contractAddress,
            createdAt,
            _title,
            _description,
            _minAmountInUsd,
            _priceFeedAddress,
            _priceFeedDecimals
        );
    }
}
