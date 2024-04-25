"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wallets_count = exports.assetParams = exports.chain = exports.router = exports.account = exports.CHAIN_ID = exports.mainWalletClient = exports.publicClient = exports.BASES = void 0;
const sdk_core_1 = require("@traderjoe-xyz/sdk-core");
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const chains_1 = require("viem/chains");
const dotenv_1 = require("dotenv");
const sdk_v2_1 = require("@traderjoe-xyz/sdk-v2");
(0, dotenv_1.config)();
const { PRIVATE_KEY, MODE } = process.env;
const chain = MODE === "dev" ? chains_1.avalancheFuji : chains_1.avalanche;
exports.chain = chain;
const CHAIN_ID = MODE === "dev" ? sdk_core_1.ChainId.FUJI : sdk_core_1.ChainId.AVALANCHE;
exports.CHAIN_ID = CHAIN_ID;
const account = (0, accounts_1.privateKeyToAccount)(`0x${PRIVATE_KEY}`);
exports.account = account;
const router = sdk_v2_1.LB_ROUTER_V21_ADDRESS[CHAIN_ID];
exports.router = router;
// initialize tokens
const WETH = sdk_core_1.WNATIVE[CHAIN_ID]; // Token instance of WETH
const USDC = MODE === "dev"
    ? new sdk_core_1.Token(CHAIN_ID, "0xB6076C93701D6a07266c31066B298AeC6dd65c2d", 6, "USDC", "USD Coin") // USDC Testnet
    : new sdk_core_1.Token(CHAIN_ID, "0x95430905F4B0dA123d41BA96600427d2C92B188a", 18, "Degen", "Cross Chain Degens DAO"); // DEGEN Mainnet
const USDT = new sdk_core_1.Token(CHAIN_ID, "0xAb231A5744C8E6c45481754928cCfFFFD4aa0732", 6, "USDT", "Tether USD");
/* Step 4 */
// declare bases used to generate trade routes
const BASES = [WETH, USDC, USDT];
exports.BASES = BASES;
const publicClient = (0, viem_1.createPublicClient)({
    chain: chain,
    transport: (0, viem_1.http)(),
});
exports.publicClient = publicClient;
const mainWalletClient = (0, viem_1.createWalletClient)({
    account,
    chain: chain,
    transport: (0, viem_1.http)(),
});
exports.mainWalletClient = mainWalletClient;
// Please update these values only
const assetParams = {
    [WETH.symbol]: {
        min: 0.03,
        max: 0.5,
    },
    [USDC.symbol]: {
        min: 1,
        max: 20,
    },
};
exports.assetParams = assetParams;
const wallets_count = 4;
exports.wallets_count = wallets_count;
