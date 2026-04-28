// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SignalFlowExecutor
 * @dev Executes trading signals on SoDEX via ValueChain
 */

interface ISoDEXRouter {
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        address to
    ) external returns (uint256 amountOut);
}

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SignalFlowExecutor {
    address public owner;
    ISoDEXRouter public sodexRouter;
    mapping(bytes32 => bool) public executedSignals;
    
    event SignalExecuted(
        bytes32 signalId,
        address indexed user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    constructor(address _sodexRouter) {
        owner = msg.sender;
        sodexRouter = ISoDEXRouter(_sodexRouter);
    }
    
    function executeSignal(
        bytes32 signalId,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        uint256 expiration
    ) external {
        require(block.timestamp <= expiration, "Signal expired");
        require(!executedSignals[signalId], "Signal already executed");
        
        // Transfer tokens from user to contract
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Approve SoDEX router
        IERC20(tokenIn).approve(address(sodexRouter), amountIn);
        
        // Execute swap
        uint256 amountOut = sodexRouter.swap(
            tokenIn,
            tokenOut,
            amountIn,
            minAmountOut,
            msg.sender
        );
        
        // Mark signal as executed
        executedSignals[signalId] = true;
        
        emit SignalExecuted(signalId, msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }
    
    function batchExecuteSignals(
        bytes32[] calldata signalIds,
        address[] calldata tokensIn,
        address[] calldata tokensOut,
        uint256[] calldata amountsIn,
        uint256[] calldata minAmountsOut,
        uint256 expiration
    ) external {
        require(
            signalIds.length == tokensIn.length &&
            tokensIn.length == tokensOut.length &&
            tokensOut.length == amountsIn.length &&
            amountsIn.length == minAmountsOut.length,
            "Array length mismatch"
        );
        
        for (uint i = 0; i < signalIds.length; i++) {
            executeSignal(
                signalIds[i],
                tokensIn[i],
                tokensOut[i],
                amountsIn[i],
                minAmountsOut[i],
                expiration
            );
        }
    }
}
