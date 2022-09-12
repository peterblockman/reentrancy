// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

contract BankReentrancyGuard {
    bool private locks;

    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external payable {
        require(!locks, 'Balances locked!');
        locks = true;

        require(balances[msg.sender] > 0, 'Not enough balance');
        (bool sent, ) = msg.sender.call{value: balances[msg.sender]}('');
        require(sent, 'failed to transfer ETH');

        balances[msg.sender] = 0;

        locks = false;
    }
}
