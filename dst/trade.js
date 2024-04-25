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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoute = exports.trade = void 0;
const sdk_core_1 = require("@traderjoe-xyz/sdk-core");
const sdk_v2_1 = require("@traderjoe-xyz/sdk-v2");
const viem_1 = require("viem");
const dotenv_1 = require("dotenv");
const const_1 = require("./const");
const utils_1 = require("./utils");
const fs_1 = __importDefault(require("./fs"));
const database_1 = require("./database");
(0, dotenv_1.config)();
const { LBRouterV21ABI } = sdk_v2_1.jsonAbis;
function getRoute(routeParams) {
    try {
        const { amount, inputToken, outputToken, isNativeIn, isNativeOut } = routeParams;
        // specify whether user gave an exact inputToken or outputToken value for the trade
        const isExactIn = true;
        // parse user input into inputToken's decimal precision, which is 6 for USDC
        const typedValueInParsed = (0, viem_1.parseUnits)(amount, inputToken.decimals);
        // wrap into TokenAmount
        const amountIn = new sdk_core_1.TokenAmount(inputToken, typedValueInParsed);
        /* Step 5 */
        // get all [Token, Token] combinations
        const allTokenPairs = sdk_v2_1.PairV2.createAllTokenPairs(inputToken, outputToken, const_1.BASES);
        // init PairV2 instances for the [Token, Token] pairs
        const allPairs = sdk_v2_1.PairV2.initPairs(allTokenPairs);
        // generates all possible routes to consider
        const allRoutes = sdk_v2_1.RouteV2.createAllRoutes(allPairs, inputToken, outputToken);
        /* Step 6 */ // Would probably want to pass this in as a variable instead of hardcoding
        // const isNativeIn = true; // set to 'true' if swapping from Native; otherwise, 'false'
        // const isNativeOut = false; // set to 'true' if swapping to Native; otherwise, 'false'
        return {
            allRoutes,
            amountIn,
            outputToken,
            isExactIn,
            isNativeIn,
            isNativeOut,
        };
    }
    catch (e) {
        console.error(e);
        throw new Error("Error generating routes");
    }
}
exports.getRoute = getRoute;
function trade(walletClient, route) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const account = walletClient.account;
            const { allRoutes, amountIn, outputToken, isExactIn, isNativeIn, isNativeOut, } = route;
            // generates all possible TradeV2 instances
            const trades = yield sdk_v2_1.TradeV2.getTradesExactIn(allRoutes, amountIn, outputToken, isNativeIn, isNativeOut, const_1.publicClient, const_1.CHAIN_ID);
            // Filter out undefined trades
            const validTrades = trades.filter((trade) => trade !== undefined);
            // chooses the best trade
            const bestTrade = sdk_v2_1.TradeV2.chooseBestTrade(validTrades, isExactIn);
            if (!bestTrade) {
                throw new Error("No valid trade found");
            }
            // Step 7
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
            // Step 8
            let nonce = yield (0, utils_1.getNonce)(account.address);
            try {
                const { request } = yield const_1.publicClient.simulateContract({
                    address: const_1.router,
                    abi: LBRouterV21ABI,
                    functionName: methodName,
                    args: args,
                    account,
                    value: BigInt(value),
                    nonce,
                });
                const hash = yield walletClient.writeContract(request);
                let txn_data = [
                    hash,
                    account.address,
                    amountIn.token.symbol,
                    outputToken.symbol,
                    amountIn.toExact(),
                    bestTrade.outputAmount.toExact(),
                    (0, utils_1.getUnixTime)(),
                ];
                (0, fs_1.default)(`${trim(account.address)} Swap ${amountIn.toExact()} ${amountIn.token.symbol} for ${bestTrade.outputAmount.toExact()} ${outputToken.symbol} \nTransaction sent with hash ${hash} \n\n`);
                yield (0, database_1.insertDB)(database_1.txn_sql, txn_data);
                yield const_1.publicClient.waitForTransactionReceipt({
                    hash,
                });
            }
            catch (err) {
                if (err instanceof viem_1.BaseError) {
                    const revertError = err.walk((err) => err instanceof viem_1.ContractFunctionExecutionError);
                    if (revertError instanceof viem_1.ContractFunctionExecutionError) {
                        const cause = revertError.cause.details;
                        const message = revertError.message;
                        const errorMessage = `ContractFunctionExecutionError: ${message} \nCause: ${cause}`;
                        (0, fs_1.default)(errorMessage, "trade_error.txt", false);
                    }
                }
            }
        }
        catch (error) {
            (0, fs_1.default)(`${error} \n\n`);
            throw new Error("Error executing trade");
        }
    });
}
exports.trade = trade;
function trim(address, startLength = 7, endLength = 5) {
    const truncatedStart = address.slice(0, startLength);
    const truncatedEnd = address.slice(-endLength);
    return truncatedStart + "..." + truncatedEnd;
}
