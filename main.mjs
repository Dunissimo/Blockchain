import { Blockchain, Transaction } from "./blockchain.mjs";

import EC from "elliptic";
const ec = new EC.ec("secp256k1");

const myKey = ec.keyFromPrivate(
  "90e84207f5d37ce2ae9643883800bb119362a0f889be88eaaa04c3d0eabc26a5"
);
const myWalletAddress = myKey.getPublic("hex");

let denCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, "public key goes here", 10);
tx1.signTransaction(myKey);
denCoin.addTransaction(tx1);
denCoin.minePendingTransactions(myWalletAddress);

const tx2 = new Transaction(myWalletAddress, "public key goes here", 10);
tx2.signTransaction(myKey);
denCoin.addTransaction(tx2);
denCoin.minePendingTransactions(myWalletAddress);

console.log("Starting the miner...");

console.log(denCoin.chain);
console.log("\n Balance = ", denCoin.getBalanceOfAddress(myWalletAddress));
