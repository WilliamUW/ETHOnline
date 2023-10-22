// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;
import {AncillaryData} from "./uma/AncillaryData.sol";
import {OptimisticOracleV3Interface} from "./uma/OptimisticOracleV3Interface.sol";
import {OptimisticOracleV3CallbackRecipientInterface} from "./uma/OptimisticOracleV3CallbackRecipientInterface.sol";

contract FaceHasher {
    OptimisticOracleV3Interface private _disputeOracle;

    struct FaceHash {
        bytes32 faceHash;
        bytes32 assertionId;
        address wallet;
    }

    mapping(bytes32 => FaceHash) public faceHashes;
    mapping(bytes32 => bytes32) public assertToFace;

    function addHash(bytes32 faceHash) public {
        faceHashes[faceHash] = FaceHash(faceHash, bytes32(0), msg.sender);
    }

    function removeHash(bytes32 faceHash) public {
        delete faceHashes[faceHash];
    }

    function assertFaultyHash(bytes32 faceHash) public {
        require(address(_disputeOracle) != address(0));
        require(faceHashes[faceHash].wallet != address(0));

        bytes memory claim = abi.encodePacked(
            "face hash",
            abi.encodePacked(faceHash),
            "is incorrectly mapped to address"
        );

        bytes32 assertionId = _disputeOracle.assertTruthWithDefaults(
            claim,
            address(this)
        );

        faceHashes[faceHash].assertionId = assertionId;
        assertToFace[assertionId] = faceHash;
    }

    function settleAndGetAssertionResult(
        bytes32 faceHash
    ) public returns (bool) {
        return
            _disputeOracle.settleAndGetAssertionResult(
                faceHashes[faceHash].assertionId
            );
    }

    function getAssertionResult(bytes32 faceHash) public view returns (bool) {
        return
            _disputeOracle.getAssertionResult(faceHashes[faceHash].assertionId);
    }

    function disputeBadRepAssurtion(bytes32 faceHash) public {
        if (address(_disputeOracle) != address(0)) {
            _disputeOracle.disputeAssertion(
                faceHashes[faceHash].assertionId,
                msg.sender
            );
        }
    }

    function assertionResolvedCallback(
        bytes32 assertionId,
        bool assertedTruthfully
    ) external {
        require(msg.sender == address(_disputeOracle));
        bytes32 faceHash = assertToFace[assertionId];

        if (assertedTruthfully) {
            delete faceHashes[faceHash];
        } else {
            faceHashes[faceHash].assertionId = bytes32(0);
        }

        assertToFace[assertionId] = bytes32(0);
    }

    function assertionDisputedCallback(bytes32 assertionId) external {
        require(msg.sender == address(_disputeOracle));
        faceHashes[assertToFace[assertionId]].assertionId = bytes32(0);
    }
}
