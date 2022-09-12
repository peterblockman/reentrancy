// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

contract Bank {
    
    mapping(address => uint) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external payable {
        require(balances[msg.sender] > 0,"Not enough balance");

        (bool success, ) = msg.sender.call{value: balances[msg.sender]}("");
        require(success, "Failed to transfer ETH");

        balances[msg.sender] = 0;
    }
}
