// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract FaceHasher {
    mapping(bytes32 => address) public faceHahses;

    function addHash(bytes32 faceHash) public {
        faceHahses[faceHash] = msg.sender;
    }

    function removeHash(bytes32 faceHash) public {
        delete faceHahses[faceHash];
    }
}
