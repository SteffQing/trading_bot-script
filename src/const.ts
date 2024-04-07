import { ChainId, WNATIVE, Token } from "@traderjoe-xyz/sdk-core";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalancheFuji } from "viem/chains";
import { config } from "dotenv";

config();
const privateKey = process.env.PRIVATE_KEY;
const CHAIN_ID = ChainId.FUJI;
const account = privateKeyToAccount(`0x${privateKey}`);

// initialize tokens
const WETH = WNATIVE[CHAIN_ID]; // Token instance of WETH
const USDC = new Token(
  CHAIN_ID,
  "0xB6076C93701D6a07266c31066B298AeC6dd65c2d",
  6,
  "USDC",
  "USD Coin"
);
const USDT = new Token(
  CHAIN_ID,
  "0xAb231A5744C8E6c45481754928cCfFFFD4aa0732",
  6,
  "USDT",
  "Tether USD"
);

const TOKENS = { usdt: USDT, usdc: USDC, weth: WETH };

/* Step 4 */
// declare bases used to generate trade routes
const BASES = [WETH, USDC, USDT];

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(),
});

const mainWalletClient = createWalletClient({
  account,
  chain: avalancheFuji,
  transport: http(),
});

function createClient(privateKey: `0x${string}`) {
  const newAccount = privateKeyToAccount(privateKey);
  return createWalletClient({
    account: newAccount,
    chain: avalancheFuji,
    transport: http(),
  });
}

export {
  BASES,
  publicClient,
  mainWalletClient,
  CHAIN_ID,
  account,
  createClient,
};
