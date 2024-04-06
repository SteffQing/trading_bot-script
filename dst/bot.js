"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_core_1 = require("@traderjoe-xyz/sdk-core");
const sdk_v2_1 = require("@traderjoe-xyz/sdk-v2");
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const chains_1 = require("viem/chains");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const privateKey = process.env.PRIVATE_KEY;
const { LBRouterV21ABI } = sdk_v2_1.jsonAbis;
const CHAIN_ID = sdk_core_1.ChainId.FUJI;
const router = sdk_v2_1.LB_ROUTER_V21_ADDRESS[CHAIN_ID];
const account = (0, accounts_1.privateKeyToAccount)(`0x${privateKey}`);
// initialize tokens
const WAVAX = sdk_core_1.WNATIVE[CHAIN_ID]; // Token instance of WAVAX
const USDC = new sdk_core_1.Token(CHAIN_ID, "0xB6076C93701D6a07266c31066B298AeC6dd65c2d", 6, "USDC", "USD Coin");
const USDT = new sdk_core_1.Token(CHAIN_ID, "0xAb231A5744C8E6c45481754928cCfFFFD4aa0732", 6, "USDT", "Tether USD");
/* Step 4 */
// declare bases used to generate trade routes
const BASES = [WAVAX, USDC, USDT];
const publicClient = (0, viem_1.createPublicClient)({
    chain: chains_1.avalancheFuji,
    transport: (0, viem_1.http)(),
});
const walletClient = (0, viem_1.createWalletClient)({
    account,
    chain: chains_1.avalancheFuji,
    transport: (0, viem_1.http)(),
});
function instaniate_routes(amount) {
    try {
        // the input token in the trade
        const inputToken = WAVAX;
        // the output token in the trade
        const outputToken = USDC;
        // specify whether user gave an exact inputToken or outputToken value for the trade
        const isExactIn = true;
        // user string input; in this case representing 20 USDC
        const typedValueIn = amount;
        // parse user input into inputToken's decimal precision, which is 6 for USDC
        const typedValueInParsed = (0, viem_1.parseUnits)(typedValueIn, inputToken.decimals);
        // wrap into TokenAmount
        const amountIn = new sdk_core_1.TokenAmount(inputToken, typedValueInParsed);
        /* Step 5 */
        // get all [Token, Token] combinations
        const allTokenPairs = sdk_v2_1.PairV2.createAllTokenPairs(inputToken, outputToken, BASES);
        // init PairV2 instances for the [Token, Token] pairs
        const allPairs = sdk_v2_1.PairV2.initPairs(allTokenPairs);
        // generates all possible routes to consider
        const allRoutes = sdk_v2_1.RouteV2.createAllRoutes(allPairs, inputToken, outputToken);
        /* Step 6 */
        const isNativeIn = true; // set to 'true' if swapping from Native; otherwise, 'false'
        const isNativeOut = false; // set to 'true' if swapping to Native; otherwise, 'false'
        return {
            allRoutes,
            amountIn,
            inputToken,
            outputToken,
            isExactIn,
            isNativeIn,
            isNativeOut,
        };
    }
    catch (e) {
        console.log(e);
        throw new Error("Error generating routes");
    }
}
function execute_trade() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { allRoutes, amountIn, inputToken, outputToken, isExactIn, isNativeIn, isNativeOut, } = instaniate_routes("0.02");
            // generates all possible TradeV2 instances
            const trades = yield sdk_v2_1.TradeV2.getTradesExactIn(allRoutes, amountIn, outputToken, isNativeIn, isNativeOut, publicClient, CHAIN_ID);
            // Filter out undefined trades
            const validTrades = trades.filter((trade) => trade !== undefined);
            // chooses the best trade
            const bestTrade = sdk_v2_1.TradeV2.chooseBestTrade(validTrades, isExactIn);
            if (!bestTrade) {
                throw new Error("No valid trade found");
            }
            /* Step 7 */
            // print useful information about the trade, such as the quote, executionPrice, fees, etc
            // console.log("bestTrade", bestTrade.toLog());
            // get trade fee information
            const { totalFeePct, feeAmountIn } = yield bestTrade.getTradeFee();
            console.log("Total fees percentage", totalFeePct.toSignificant(6), "%");
            console.log(`Fee: ${feeAmountIn.toSignificant(6)} ${feeAmountIn.token.symbol}`);
            // Step 8
            // set slippage tolerance
            const userSlippageTolerance = new sdk_core_1.Percent("50", "10000"); // 0.5%
            // set swap options
            const swapOptions = {
                allowedSlippage: userSlippageTolerance,
                ttl: 3600,
                recipient: account.address,
                feeOnTransfer: false, // or true
            };
            // generate swap method and parameters for contract call
            const { methodName, // e.g. swapExactTokensForNATIVE,
            args, // e.g.[amountIn, amountOut, (pairBinSteps, versions, tokenPath) to, deadline]
            value, // e.g. 0x0
             } = bestTrade.swapCallParameters(swapOptions);
            // Step 9
            const { request } = yield publicClient.simulateContract({
                address: router,
                abi: LBRouterV21ABI,
                functionName: methodName,
                args: args,
                account,
                value: BigInt(value),
            });
            const hash = yield walletClient.writeContract(request);
            console.log(`Transaction sent with hash ${hash}`);
        }
        catch (error) {
            console.log(error);
            throw new Error("Error executing trade");
        }
    });
}
const INTERVAL = 1000 * 10;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                yield execute_trade();
            }), INTERVAL);
        }
        catch (error) {
            console.log(error);
            throw new Error("Error running script");
        }
    });
}
main();
