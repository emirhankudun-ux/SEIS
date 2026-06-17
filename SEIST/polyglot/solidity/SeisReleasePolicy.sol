// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SeisReleasePolicy {
    bool public constant serverTargetConfirmed = false;
    bool public constant reducedMotionSupported = true;
    uint8 public constant minimumEvidenceItems = 3;

    function readyForUpload(bool accessibilityReviewed, bool rollbackPlanned) public pure returns (bool) {
        return serverTargetConfirmed && accessibilityReviewed && rollbackPlanned;
    }
}
