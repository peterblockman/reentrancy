import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, waffle } from 'hardhat';
import { createTestFixtures, expectError } from '../utils/utils';
import { expect } from 'chai';

describe('ReentrancyGuard', function () {
  beforeEach(async function () {
    const { users, contracts } = await loadFixture(createTestFixtures);
    this.users = users;
    this.attacker = this.users[1];
    this.owner = this.users[0];
    this.contracts = contracts;
  });

  describe('Attack', async function () {
    beforeEach(async function () {
      await this.owner.bankReentrancyGuard.deposit({
        value: ethers.utils.parseEther('10'),
      });
      await this.owner.attackReentrancyGuard.changeOwner(this.attacker.address);

      const signer = await ethers.getSigner(this.attacker.address);

      await signer.sendTransaction({
        to: this.contracts.attackReentrancyGuard.address,
        value: ethers.utils.parseEther('2'),
        gasLimit: 50000,
      });
    });
    it('Should revert when attacker try to call withdraw again', async function () {
      await expectError('failed to transfer ETH', async () => {
        await this.attacker.attackReentrancyGuard.exploit();
      });
    });
  });
});
