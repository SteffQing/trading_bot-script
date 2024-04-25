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
const viem_1 = require("viem");
const const_1 = require("./const");
const trade_1 = require("./trade");
const utils_1 = require("./utils");
const wallets_1 = require("./wallets");
const fs_1 = __importDefault(require("./fs"));
const database_1 = require("./database");
const fs_2 = require("fs");
const [WETH, USDC] = const_1.BASES;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const CLIENTS = [];
        var PRIVATE_KEYS = [];
        (0, utils_1.validateInputs)();
        (0, utils_1.validateWalletsFile)();
        try {
            yield (0, database_1.connectDB)();
            const InToken = {};
            const MaxedOut = {};
            const data = (0, fs_2.readFileSync)("./secret/trading_keys.txt", "utf8");
            PRIVATE_KEYS = JSON.parse((0, utils_1.decryptKey)(data));
            PRIVATE_KEYS.forEach((key) => {
                const client = (0, utils_1.createClient)(key);
                CLIENTS.push(client);
                let address = client.account.address;
                let index = getRandomIndex();
                InToken[address] = index;
                MaxedOut[address] = new Set();
            });
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < CLIENTS.length; j++) {
                    let currentClient = CLIENTS[j];
                    let currentAddress = (_a = currentClient.account) === null || _a === void 0 ? void 0 : _a.address;
                    let tokenIndex = InToken[currentAddress];
                    let inputToken = const_1.BASES[tokenIndex];
                    let outputToken = const_1.BASES[(tokenIndex + 1) % 2];
                    InToken[currentAddress] = tokenIndex === 0 ? 1 : 0;
                    let [isNativeIn, isNativeOut] = [tokenIndex === 0, tokenIndex === 1];
                    const [min, max] = [
                        const_1.assetParams[inputToken.symbol].min,
                        const_1.assetParams[inputToken.symbol].max,
                    ];
                    const newMax = yield getMax(currentAddress, inputToken, max);
                    if (newMax <= 0.01) {
                        MaxedOut[currentAddress].add(inputToken.symbol);
                        if (MaxedOut[currentAddress].size === 2) {
                            yield (0, wallets_1.fund_account)({
                                tokenAddress: USDC.address,
                                decimals: USDC.decimals,
                                eth_amount: const_1.assetParams[WETH.symbol].max.toString(),
                                token_amount: const_1.assetParams[USDC.symbol].max.toString(),
                                recipientAddress: currentAddress,
                            });
                            MaxedOut[currentAddress].clear();
                        }
                        continue;
                    }
                    let amount = getRandomNumber(min, newMax).toFixed(2).toString();
                    let routeParams = {
                        amount,
                        inputToken,
                        outputToken,
                        isNativeIn,
                        isNativeOut,
                    };
                    let route = (0, trade_1.getRoute)(routeParams);
                    yield (0, trade_1.trade)(currentClient, route);
                }
            }
            (0, fs_1.default)("Bot Script completed successfully!");
        }
        catch (err) {
            (0, fs_1.default)(`An error occurred: ${err}`, "error.txt");
        }
        finally {
            yield (0, database_1.closeDB)();
        }
    });
}
function getRandomNumber(min, max) {
    let newMin = min > max ? 0.01 : min;
    return Math.random() * (max - newMin) + newMin;
}
function getRandomIndex() {
    return Math.floor(Math.random() * 2);
}
function getMax(currentAddress, inputToken, max) {
    return __awaiter(this, void 0, void 0, function* () {
        let balance = yield (0, utils_1.getBalance)(currentAddress, inputToken.address);
        balance = (0, viem_1.formatUnits)(balance, inputToken.decimals);
        balance = Number(balance);
        return max >= balance
            ? inputToken.symbol === WETH.symbol
                ? balance - 0.01
                : balance
            : max;
    });
}
run().catch((error) => {
    console.error("bot error", error);
    process.exit(1);
});
