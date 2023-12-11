import SHA256 from "crypto-js/sha256.js";

import EC from "elliptic";
const ec = new EC.ec("secp256k1");

export class Transaction {
  constructor(from, to, amount) {
    this.from = from;
    this.to = to;
    this.amount = amount;
  }

  calculateHash() {
    return SHA256(this.from + this.to + this.amount).toString();
  }

  signTransaction(signingKey) {
    if (signingKey.getPublic("hex") !== this.from) {
      throw new Error("You can't sign transactions for other wallets");
    }

    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, "base64");

    this.signature = sig.toDER("hex");
  }

  isValid() {
    if (this.from === null) return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error("No signature in this transaction!");
    }

    const publicKey = ec.keyFromPublic(this.from, "hex");
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

export class Block {
  constructor(timestamp, transactions, previousHash = "") {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(
      this.previousHash +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.nonce
    ).toString();
  }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join(0)
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log("Block mined: ", this.hash);
  }

  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }

    return true;
  }
}

export class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
    return new Block("01/01/2023", "Genesis block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(
      null,
      miningRewardAddress,
      this.miningReward
    );
    this.pendingTransactions.push(rewardTx);

    const block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);

    console.log("Block successfuly mined");
    this.chain.push(block);

    this.pendingTransactions = [];
  }

  addTransaction(transaction) {
    if (!transaction.from || !transaction.to) {
      throw new Error("Transactions must include from and to address");
    }

    if (!transaction.isValid()) {
      throw new Error("Can't add invalid transaction to chain");
    }

    const walletBalance = this.getBalanceOfAddress(transaction.fromAddress);
    if (walletBalance < transaction.amount) {
      throw new Error("Not enough balance");
    }

    const pendingTxForWallet = this.pendingTransactions.filter(
      (tx) => tx.fromAddress === transaction.fromAddress
    );

    if (pendingTxForWallet.length > 0) {
      const totalPendingAmount = pendingTxForWallet
        .map((tx) => tx.amount)
        .reduce((prev, curr) => prev + curr);

      const totalAmount = totalPendingAmount + transaction.amount;
      if (totalAmount > walletBalance) {
        throw new Error(
          "Pending transactions for this wallet is higher than its balance."
        );
      }
    }

    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.from == address) {
          balance -= trans.amount;
        }

        if (trans.to == address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const item = this.chain[i];
      const previous = this.chain[i - 1];

      if (!item.hasValidTransactions()) {
        return false;
      }

      if (item.hash !== item.calculateHash()) {
        return false;
      }

      if (item.previousHash !== previous.hash) {
        return false;
      }
    }

    return true;
  }
}
