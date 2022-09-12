import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ethers, waffle } from 'hardhat';
import { createTestFixtures } from '../utils/utils';
import { expect } from 'chai';

describe('Reentrancy', function () {
  beforeEach(async function () {
    const { users, contracts } = await loadFixture(createTestFixtures);
    this.users = users;
    this.attacker = this.users[1];
    this.owner = this.users[0];
    this.contracts = contracts;
  });

  describe('Attack', async function () {
    beforeEach(async function () {
      await this.owner.bank.deposit({ value: ethers.utils.parseEther('10') });
      await this.owner.attack.changeOwner(this.attacker.address);

      const signer = await ethers.getSigner(this.attacker.address);

      await signer.sendTransaction({
        to: this.contracts.attack.address,
        value: ethers.utils.parseEther('2'),
        gasLimit: 50000,
      });
    });
    it('Should drain all the funds ', async function () {
      const balanceBefore = await waffle.provider.getBalance(
        this.contracts.bank.address
      );

      expect(balanceBefore).to.eq(ethers.utils.parseEther('10'));
      await this.attacker.attack.exploit();

      const balanceAfter = await waffle.provider.getBalance(
        this.contracts.bank.address
      );

      expect(balanceAfter).to.eq(ethers.utils.parseEther('0'));
    });
  });
});
