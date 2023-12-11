declare module "Blockchain" {
  export class Transaction {
    constructor(from: string, to: string, amount: number);

    calculateHash(): string;

    signTransaction(signingKey: any): void;

    isValid(): boolean;
  }

  export class Block {
    constructor(
      timestamp: Date | string,
      transactions: Transaction[],
      previousHash: string
    );

    calculateHash(): string;

    mineBlock(difficulty: number): void;

    hasValidTransactions(): boolean;
  }

  export class Blockchain {
    constructor();

    createGenesisBlock(): Block;

    getLatestBlock(): Block;

    minePendingTransactions(miningRewardAddress: string): void;

    addTransaction(transaction: Transaction): void;

    getBalanceOfAddress(address: string): number;

    isChainValid(): boolean;
  }
}
