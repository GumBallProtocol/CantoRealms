// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Wrapper.sol";
import '@openzeppelin/contracts/access/Ownable.sol';
import 'contracts/interfaces/ICToken.sol';
import 'contracts/interfaces/IComptroller.sol';
import 'contracts/interfaces/IPlugin.sol';

interface IXGBT {
    function notifyRewardAmount(address _rewardsToken, uint256 reward) external; 
}

contract CTokenPlugin is ERC20Wrapper, Ownable, IPlugin {
    using SafeERC20 for IERC20;

    address public immutable comptroller;
    address public XGBT;

    address[] public tokensInUnderlying;
    address[] public rewardTokens;

    event Set_Staking_Contract(address account, address _xgbt);

    constructor(string memory _name, string memory _symbol, IERC20 _underlying, address[] memory _rewardTokens, address[] memory _tokensInUnderlying) 
        ERC20(_name, _symbol)
        ERC20Wrapper(_underlying)
    {
        comptroller = ICToken(address(underlying)).comptroller();
        tokensInUnderlying = _tokensInUnderlying;
        rewardTokens = _rewardTokens;
    }

    //////////////////
    ////// View //////
    //////////////////

    function getUnderlyingTokenName() external view returns (string memory) {
        return ICToken(address(underlying)).name();
    }

    function getUnderlyingTokenSymbol() external view returns (string memory) {
        return ICToken(address(underlying)).symbol();
    }

    function getUnderlyingTokenAddress() external view returns (address) {
        return address(underlying);
    }

    function getComptroller() external view returns (address) {
        return comptroller;
    }

    function earned() external view returns (uint256) {
        return IComptroller(comptroller).compAccrued(address(this));
    }

    function getXGBT() external view returns (address) {
        return XGBT;
    }

    function getTokensInUnderlying() external view returns (address[] memory) {
        return tokensInUnderlying;
    }

    function getRewardTokens() external view returns (address[] memory) {
        return rewardTokens;
    }

    ////////////////////
    ///// Mutative /////
    ////////////////////

    function claimAndDistribute() external {
        IComptroller(comptroller).claimComp(address(this));
        uint256 tokenCount = rewardTokens.length;
        for (uint i = 0; i < tokenCount; i++) {
            address token = rewardTokens[i];
            uint256 balance = IERC20(token).balanceOf(address(this));
            IERC20(token).safeApprove(XGBT, 0);
            IERC20(token).safeApprove(XGBT, balance);
            IXGBT(XGBT).notifyRewardAmount(token, balance);
        }
    }

    ////////////////////
    //// Restricted ////
    ////////////////////

    function setXGBT(address _XGBT) external onlyOwner {
        XGBT = _XGBT;
        emit Set_Staking_Contract(msg.sender, _XGBT);
    }

}