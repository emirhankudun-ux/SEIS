// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SeisReleaseGuard {
    string public constant packagePath = "dist/seis-static.zip";
    bool public constant reducedMotionRequired = true;
    bool public constant liveUploadRequiresTarget = true;

    function canUpload(bool targetConfirmed, bool checksumMatched) public pure returns (bool) {
        return targetConfirmed && checksumMatched;
    }
}
