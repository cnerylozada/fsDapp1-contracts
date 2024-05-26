// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./PriceLibrary.sol";

error FundMe__NotOwner();
error FundMe__NotEnoughFunds();

contract FundMe {
    using PriceLibrary for uint256;
    uint256 public MINIMUN_USD_AMOUNT = 25;
    mapping(address => uint256) public addressToAmountFunded;
    address[] public funders;

    address public owner;
    AggregatorV3Interface public dataFeed;

    modifier onlyOwner() {
        if (msg.sender != owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address _priceFeedAddress) {
        owner = msg.sender;
        dataFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    function fund() public payable {
        if (msg.value.convertAmountInUSD(dataFeed) < MINIMUN_USD_AMOUNT)
            revert FundMe__NotEnoughFunds();
        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
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
