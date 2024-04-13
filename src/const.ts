import { ChainId, WNATIVE, Token } from "@traderjoe-xyz/sdk-core";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalanche } from "viem/chains";
import { config } from "dotenv";
import { LB_ROUTER_V21_ADDRESS } from "@traderjoe-xyz/sdk-v2";

config();
const privateKey = process.env.PRIVATE_KEY;
const CHAIN_ID = ChainId.AVALANCHE;
const account = privateKeyToAccount(`0x${privateKey}`);
const router = LB_ROUTER_V21_ADDRESS[CHAIN_ID];

// initialize tokens
const WETH = WNATIVE[CHAIN_ID]; // Token instance of WETH
// const USDC = new Token(
//   CHAIN_ID,
//   "0xB6076C93701D6a07266c31066B298AeC6dd65c2d",
//   6,
//   "USDC",
//   "USD Coin"
// );
const USDC = new Token(
  CHAIN_ID,
  "0x95430905F4B0dA123d41BA96600427d2C92B188a",
  18,
  "Degen",
  "Cross Chain Degens DAO"
);
const USDT = new Token(
  CHAIN_ID,
  "0xAb231A5744C8E6c45481754928cCfFFFD4aa0732",
  6,
  "USDT",
  "Tether USD"
);

/* Step 4 */
// declare bases used to generate trade routes
const BASES = [WETH, USDC, USDT];

const publicClient = createPublicClient({
  chain: avalanche,
  transport: http(),
});

const mainWalletClient = createWalletClient({
  account,
  chain: avalanche,
  transport: http(),
});

export { BASES, publicClient, mainWalletClient, CHAIN_ID, account, router };
