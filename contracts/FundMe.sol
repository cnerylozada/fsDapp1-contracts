// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

import "./PriceLibrary.sol";

contract FundMe {
    using PriceLibrary for uint256;
    uint256 public MINIMUN_USD_AMOUNT = 25;
    mapping(address => uint256) public addressToAmountFunded;
    address[] public funders;

    address public owner;
    AggregatorV3Interface public dataFeed;

    constructor(address _priceFeedAddress) {
        owner = msg.sender;
        dataFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    function fund() public payable {
        require(
            msg.value.convertAmountInUSD(dataFeed) >= MINIMUN_USD_AMOUNT,
            "Dint send you enough"
        );
        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    function withdraw() public onlyOwner {
        for (uint256 index; index < funders.length; index++) {
            address funder = funders[index];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }
}
