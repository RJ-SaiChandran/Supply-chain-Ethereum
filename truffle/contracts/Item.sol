//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;
import "./ItemManager.sol";

contract Item {
    uint256 public priceInWei;
    uint256 public pricePaid;
    uint256 public index;

    ItemManager parentContract;

    constructor(
        ItemManager _parentContract,
        uint256 _priceInWei,
        uint256 _index
    ) {
        priceInWei = _priceInWei;
        index = _index;
        parentContract = _parentContract;
    }

    receive() external payable {
        require(pricePaid == 0, "Item is paid already");
        require(priceInWei == msg.value, "Only full payments allowed");
        pricePaid += msg.value;
        (bool success, ) = address(parentContract).call{value: msg.value}(
            abi.encodeWithSignature("triggerPayment(uint256)", index)
        );
        require(success, "The transaction wasn't successful canceling");
    }

    fallback() external {}
}
