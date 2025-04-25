// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Merkle {
    bytes32 s_merkleRoot;
    address s_owner;
    bool s_isMerkleRootEmpty = true;

    modifier onlyOwner() {
        require(msg.sender == s_owner);
        _;
    }

    constructor(address _owner) {
        s_owner = _owner;
    }

    function getOwner() external view returns (address) {
        return s_owner;
    }

    function getMerkleRoot() external view returns (bytes32) {
        return s_merkleRoot;
    }

    function setRoot(bytes32 _root) external onlyOwner {
        if (!s_isMerkleRootEmpty) revert();
        s_merkleRoot = _root;
        s_isMerkleRootEmpty = false;
    }

    function verify(
        bytes32[] memory proof,
        string memory addr
    ) external view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(addr));
        return (MerkleProof.verify(proof, s_merkleRoot, leaf));
    }
}
