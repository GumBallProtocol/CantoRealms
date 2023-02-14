// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

interface ICToken {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function comptroller() external view returns (address);
}