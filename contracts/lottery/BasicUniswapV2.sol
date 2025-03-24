// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {IWETH, IERC20, IUniswapV2Router} from "./CustomInterfaces.sol";

contract BasicUniswapV2 {
    error NotEnoughFunds();

    address constant UNISWAP_V2_ROUTER =
        0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3;
    address immutable WETH;
    address immutable LINK;

    IUniswapV2Router private router = IUniswapV2Router(UNISWAP_V2_ROUTER);
    IWETH s_weth;

    constructor(address _weth, address _link) {
        WETH = _weth;
        LINK = _link;
        s_weth = IWETH(WETH);
    }

    function swapETHForLINK() external payable returns (uint256 amountOut) {
        uint256 amountIn = msg.value;
        if (amountIn == 0) revert NotEnoughFunds();

        s_weth.deposit{value: msg.value}();
        s_weth.approve(address(router), amountIn);

        address[] memory path;
        path = new address[](2);
        path[0] = WETH;
        path[1] = LINK;

        uint256[] memory amounts = router.swapExactTokensForTokens(
            amountIn,
            0,
            path,
            msg.sender,
            block.timestamp
        );

        return amounts[1];
    }
}
