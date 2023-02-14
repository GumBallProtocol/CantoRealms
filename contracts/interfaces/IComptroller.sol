// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

interface IComptroller {
    function compAccrued(address account) external view returns (uint256);
    function claimComp(address account) external;
}