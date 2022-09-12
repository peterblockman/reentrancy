import { Contracts, User } from "../utils/interface";

declare module "mocha" {
    export interface Context {
      users: User[];
      contracts: Contracts;
      attacker: User,
      owner: User
    }
  }