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
const wallets_1 = require("./wallets");
const fs_1 = __importDefault(require("./fs"));
const fs_2 = require("fs");
const utils_1 = require("./utils");
const [, USDC] = const_1.BASES;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const CLIENTS = [];
        let PRIVATE_KEYS = [];
        (0, utils_1.validateWalletsFile)();
        try {
            const data = (0, fs_2.readFileSync)("./secret/trading_keys.txt", "utf8");
            PRIVATE_KEYS = JSON.parse((0, utils_1.decryptKey)(data));
            PRIVATE_KEYS.forEach((key) => {
                const client = (0, utils_1.createClient)(key);
                CLIENTS.push(client);
            });
            for (let k = 0; k < CLIENTS.length; k++) {
                yield (0, wallets_1.defund_account)(USDC.address, CLIENTS[k]);
            }
            (0, fs_1.default)("Close Script completed successfully!");
        }
        catch (err) {
            try {
                for (let i = 0; i < CLIENTS.length; i++) {
                    yield (0, wallets_1.defund_account)(USDC.address, CLIENTS[i]);
                }
                (0, fs_1.default)("Accounts defunded");
            }
            catch (e) {
                (0, fs_1.default)(`Error in defund accounts: ${e.toString().replace(/\n/g, "\r\n")}`, undefined, true);
            }
            (0, fs_1.default)(err, undefined, true);
        }
    });
}
run().catch((error) => {
    console.error("close error", error);
    process.exit(1);
});
