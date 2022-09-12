import { Contract as EthersContract } from 'ethers';

export type Contract = EthersContract;
export type ContractNameKey =
  | 'bank'
  | 'attack'
  | 'bankReentrancyGuard'
  | 'attackReentrancyGuard';

export type Contracts = Record<ContractNameKey, Contract>;

export type User = {
  address: string;
} & Contracts;

export interface TestFixtures {
  contracts: Contracts;
  users: User[];
}
