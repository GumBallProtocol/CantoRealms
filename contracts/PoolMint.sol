// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IGBT {
    function buy(uint256 _amountBASE, uint256 _minGBT, uint256 expireTimestamp, address affiliate) external;
}

contract PoolMint {
    using SafeERC20 for IERC20;

    uint256 public immutable end;
    address public immutable base;
    address public immutable gbt;
    mapping(address => uint256) public baseBalances;
    uint256 public baseTotal;
    uint256 public gbtTotal;
    mapping(address => bool) public claimed;
    bool public ended;

    event Deposited(address indexed account, uint256 amount);
    event Claimed(address indexed account, uint256 amount);

    constructor(address _base, address _gbt, uint256 _delay) {
        base = _base;
        gbt = _gbt;
        end = block.timestamp + _delay;
    }

    ////////////////////
    ///// Mutative /////
    ////////////////////

    function deposit(uint256 amount) external {
        require(amount > 0, "Cannot deposit 0");
        require(!ended, "Pool has ended");
        address account = msg.sender;
        baseBalances[account] += amount;
        baseTotal += amount;
        IERC20(base).safeTransferFrom(account, address(this), amount);
        emit Deposited(account, amount);
    }

    function endAndBuy() external {
        require(block.timestamp > end, "Pool still in progress");
        require(!ended, "End and Buy already called");
        ended = true;
        IERC20(base).approve(gbt, baseTotal);
        IGBT(gbt).buy(baseTotal, 0, 0, address(0));
        gbtTotal = IERC20(gbt).balanceOf(address(this));
    }

    function claimFor(address account) external {
        require(ended, "Pool still in progress");
        require(!claimed[account], "Account has already claimed");
        uint256 balanceGBT = baseBalances[account] * gbtTotal / baseTotal;
        claimed[account] = true;
        IERC20(gbt).approve(address(this), balanceGBT);
        IERC20(gbt).safeTransferFrom(address(this), account, balanceGBT);
        emit Claimed(account, balanceGBT);
    }

}