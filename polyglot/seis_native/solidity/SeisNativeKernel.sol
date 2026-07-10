// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SeisNativeKernel {
    string public constant APPLE_FIRST = "Apple First";
    string public constant DATA_AI = "Data AI";
    string public constant SYSTEMS = "Systems";
    string public constant ANDROID = "Android";
    string public constant WINDOWS = "Windows";
    string public constant INFRASTRUCTURE = "Infrastructure";

    function topLane() external pure returns (string memory) {
        return APPLE_FIRST;
    }
}
