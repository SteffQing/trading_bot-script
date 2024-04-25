import { ChainId, WNATIVE, Token } from "@traderjoe-xyz/sdk-core";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalanche, avalancheFuji } from "viem/chains";
import { config } from "dotenv";
import { LB_ROUTER_V21_ADDRESS } from "@traderjoe-xyz/sdk-v2";

config();
const { PRIVATE_KEY, MODE } = process.env;
const chain = MODE === "dev" ? avalancheFuji : avalanche;
const CHAIN_ID = MODE === "dev" ? ChainId.FUJI : ChainId.AVALANCHE;

const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
const router = LB_ROUTER_V21_ADDRESS[CHAIN_ID];

// initialize tokens
const WETH = WNATIVE[CHAIN_ID]; // Token instance of WETH
const USDC =
  MODE === "dev"
    ? new Token(
        CHAIN_ID,
        "0xB6076C93701D6a07266c31066B298AeC6dd65c2d",
        6,
        "USDC",
        "USD Coin"
      ) // USDC Testnet
    : new Token(
        CHAIN_ID,
        "0x95430905F4B0dA123d41BA96600427d2C92B188a",
        18,
        "Degen",
        "Cross Chain Degens DAO"
      ); // DEGEN Mainnet
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
  chain: chain,
  transport: http(),
});

const mainWalletClient = createWalletClient({
  account,
  chain: chain,
  transport: http(),
});

// Please update these values only
const assetParams = {
  [WETH.symbol!]: {
    min: 0.03,
    max: 0.5,
  },
  [USDC.symbol!]: {
    min: 1,
    max: 20,
  },
};
const wallets_count = 4;

export {
  BASES,
  publicClient,
  mainWalletClient,
  CHAIN_ID,
  account,
  router,
  chain,
  assetParams,
  wallets_count,
};
