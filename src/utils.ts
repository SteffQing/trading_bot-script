import { Account, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ERC20ABI } from "@traderjoe-xyz/sdk";
import { BASES, publicClient, chain, assetParams } from "./const";
import { existsSync } from "fs";
import CryptoJS from "crypto-js";
import { config } from "dotenv";

config();

function createClient(privateKey: `0x${string}`) {
  const newAccount = privateKeyToAccount(privateKey);
  return createWalletClient({
    account: newAccount,
    chain: chain,
    transport: http(),
  });
}

async function getGas(account: Account, to: `0x${string}`, value: bigint) {
  return await publicClient.estimateGas({
    account,
    to,
    value,
  });
}
async function getGasPrice() {
  return await publicClient.getGasPrice();
}

async function getNonce(address: `0x${string}`) {
  return await publicClient.getTransactionCount({
    address,
  });
}

async function getApproval(
  route: `0x${string}`,
  account: `0x${string}`,
  tokenAddress: `0x${string}`
) {
  return await publicClient.readContract({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: "allowance",
    args: [account, route],
  });
}

async function getBalance(
  walletAddress: `0x${string}`,
  tokenAddress?: `0x${string}` | undefined
) {
  let balance = BigInt(0);
  if (
    tokenAddress !== undefined &&
    tokenAddress.toLowerCase() !== BASES[0].address.toLowerCase()
  ) {
    balance = (await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20ABI,
      functionName: "balanceOf",
      args: [walletAddress],
    })) as bigint;
  } else {
    balance = await publicClient.getBalance({
      address: walletAddress,
    });
  }
  return balance;
}

function getUnixTime() {
  return Math.floor(new Date().getTime() / 1000);
}

function validateInputs() {
  for (const symbol in assetParams) {
    const { min, max } = assetParams[symbol];
    if (min < 0.01 || max <= min) {
      throw new Error("Invalid min or max values");
    }
  }
}

// Encrypt function
export function keyGen(text: string): string {
  return CryptoJS.AES.encrypt(
    text,
    process.env.SECRET_KEY as string
  ).toString();
}

// Decrypt function
export function decryptKey(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(
    ciphertext,
    process.env.SECRET_KEY as string
  );

  return bytes.toString(CryptoJS.enc.Utf8);
}

function validateWalletsFile() {
  if (!existsSync("./secret/trading_keys.txt")) {
    throw new Error("Trading Keys file not found");
  }
}

export {
  getApproval,
  getNonce,
  createClient,
  getGas,
  getBalance,
  getGasPrice,
  getUnixTime,
  validateInputs,
  validateWalletsFile,
};
