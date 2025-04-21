// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {FundMe} from "./FundMe.sol";

contract FundMeFactory {
    struct BaseMetadata {
        string title;
        string description;
        uint minAmountInUsd;
        address priceFeedAddress;
        int priceFeedDecimals;
    }
    event NewCrowdFunding(
        address indexed contractAddress,
        uint createdAt,
        BaseMetadata metadata
    );
    struct Metadata {
        address contractAddress;
        uint createdAt;
        BaseMetadata metadata;
    }
    Metadata[] s_contractsCreated;

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
        BaseMetadata memory baseMetadata = BaseMetadata({
            title: _title,
            description: _description,
            minAmountInUsd: _minAmountInUsd,
            priceFeedAddress: _priceFeedAddress,
            priceFeedDecimals: _priceFeedDecimals
        });
        emit NewCrowdFunding(contractAddress, createdAt, baseMetadata);
        s_contractsCreated.push(
            Metadata({
                contractAddress: contractAddress,
                createdAt: createdAt,
                metadata: baseMetadata
            })
        );
    }

    function contractsCreated() external view returns (Metadata[] memory) {
        return s_contractsCreated;
    }
}
