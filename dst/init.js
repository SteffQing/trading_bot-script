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
const const_1 = require("./const");
const utils_1 = require("./utils");
const wallets_1 = require("./wallets");
const fs_1 = __importDefault(require("./fs"));
const database_1 = require("./database");
const fs_2 = require("fs");
const [WETH, USDC] = const_1.BASES;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const CLIENTS = [];
        const PRIVATE_KEYS = [];
        (0, utils_1.validateInputs)();
        try {
            yield (0, database_1.connectDB)();
            for (let i = 0; i < const_1.wallets_count; i++) {
                // Generate new key and client, fund and add to array
                let privateKey = (0, wallets_1.gen_key)();
                PRIVATE_KEYS.push(privateKey);
                const client = (0, utils_1.createClient)(privateKey);
                CLIENTS.push(client);
                let address = client.account.address;
                try {
                    let trader_data = [privateKey, address];
                    yield (0, database_1.insertDB)(database_1.traders_sql, trader_data);
                }
                catch (error) {
                    console.error("Couldn't add data to db");
                    continue;
                }
                yield (0, wallets_1.fund_account)({
                    tokenAddress: USDC.address,
                    decimals: USDC.decimals,
                    eth_amount: const_1.assetParams[WETH.symbol].max.toString(),
                    token_amount: const_1.assetParams[USDC.symbol].max.toString(),
                    recipientAddress: address,
                });
                yield (0, wallets_1.approve_router)(USDC.address, client);
            }
            const arrayAsString = JSON.stringify(PRIVATE_KEYS);
            const keyCipher = (0, utils_1.keyGen)(arrayAsString);
            // Write the cipher to a file
            (0, fs_2.writeFileSync)("./secret/trading_keys.txt", keyCipher);
            (0, fs_1.default)("Init Script completed successfully!");
        }
        catch (err) {
            try {
                for (let i = 0; i < CLIENTS.length; i++) {
                    yield (0, wallets_1.defund_account)(USDC.address, CLIENTS[i]);
                }
                (0, fs_1.default)("Accounts defunded");
            }
            catch (e) {
                (0, fs_1.default)(`Error in defund accounts: ${PRIVATE_KEYS}`, undefined, true);
            }
            (0, fs_1.default)(err, undefined, true);
        }
        finally {
            yield (0, database_1.closeDB)();
        }
    });
}
run().catch((error) => {
    console.error("init error", error);
    process.exit(1);
});
