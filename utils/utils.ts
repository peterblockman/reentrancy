import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, getUnnamedAccounts } from 'hardhat';

import { TestFixtures, User, Contracts, ContractNameKey } from './interface';
export const expectError = async function (message: string, fn: Function) {
  if (!(message.length > 0))
    throw new Error('Message must not be an empty string');

  let errorMsg = '';
  try {
    await fn();
  } catch (e: any) {
    errorMsg = e.message;
  } finally {
    if (errorMsg) {
      console.log('Error msg:', errorMsg);
    } else {
      console.log('Expected an error, but got none');
    }
    expect(errorMsg).to.have.string(message);
  }
};

export async function setupUser(
  contracts: Contracts,
  address: string
): Promise<User> {
  const user = {
    address,
  } as User;
  const signer = await ethers.getSigner(address);
  if (!signer._isSigner) {
    throw new Error('Not a signer');
  }

  for (const contractName of Object.keys(contracts)) {
    user[contractName as ContractNameKey] = contracts[
      contractName as ContractNameKey
    ].connect(signer as any); // hack to bypass type error
  }

  return user;
}

export async function setupUsers(
  addresses: string[],
  contracts: Contracts
): Promise<User[]> {
  const users: User[] = [];

  await Promise.all(
    addresses.map(async (address: string) => {
      const user = await setupUser(contracts, address);
      users.push(user);
    })
  );

  // Promise.all and forof loops ruin the address order
  const correctOrderUsers = addresses.map((address: string) => {
    const user = users.find((user: User) => user.address === address);
    if (!user) throw new Error('user not found');
    return user;
  }) as User[];

  return correctOrderUsers;
}

export async function deployContract(
  contractName: string,
  ...arg: any[]
): Promise<Contract> {
  const contract = await ethers.getContractFactory(contractName);

  const deployedContract = await contract.deploy(...arg);
  await deployedContract.deployed();
  return deployedContract;
}

export async function deployContracts(): Promise<{
  contracts: Contracts;
}> {
  const bank = await deployContract('Bank');
  const attack = await deployContract('Attack', bank.address);
  const bankReentrancyGuard = await deployContract('BankReentrancyGuard');
  const attackReentrancyGuard = await deployContract(
    'AttackReentrancyGuard',
    bankReentrancyGuard.address
  );
  return {
    contracts: {
      bank,
      attack,
      bankReentrancyGuard,
      attackReentrancyGuard,
    },
  };
}

export const createTestFixtures = async (): Promise<TestFixtures> => {
  const { contracts } = await deployContracts();

  const users = await setupUsers(await getUnnamedAccounts(), contracts);

  return {
    contracts,
    users,
  };
};
