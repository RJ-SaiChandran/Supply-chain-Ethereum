//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

contract Ownable {
    address payable _owner;

    constructor() {
        _owner = payable(msg.sender);
    }

    function isOwner() public view returns (bool) {
        return (msg.sender == _owner);
    }

    modifier onlyOwner() {
        require(isOwner(), "You are not the owner");
        _;
    }
}
