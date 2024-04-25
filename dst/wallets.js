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
exports.approve_router = exports.defund_account = exports.fund_account = exports.gen_key = void 0;
const accounts_1 = require("viem/accounts");
const const_1 = require("./const");
const viem_1 = require("viem");
const sdk_1 = require("@traderjoe-xyz/sdk");
const utils_1 = require("./utils");
const fs_1 = __importDefault(require("./fs"));
function gen_key() {
    const privateKey = (0, accounts_1.generatePrivateKey)();
    (0, fs_1.default)(privateKey, "./wallets.txt");
    return privateKey;
}
exports.gen_key = gen_key;
const BigIntZero = BigInt(0);
const BigIntRemainder = (0, viem_1.parseEther)("0.000105");
function fund_account(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { tokenAddress, decimals, eth_amount, token_amount, recipientAddress } = params;
        // TODO
        // : Implement funding account logic based on current gas prices
        try {
            // Fund with ETH
            const hash1 = yield const_1.mainWalletClient.sendTransaction({
                to: recipientAddress,
                value: (0, viem_1.parseEther)(eth_amount),
            });
            // const receipt = await publicClient.waitForTransactionReceipt({
            //   hash: hash1,
            // });
            // Fund with ERC20 token
            let nonce = yield (0, utils_1.getNonce)(const_1.account.address);
            const { request } = yield const_1.publicClient.simulateContract({
                address: tokenAddress,
                abi: sdk_1.ERC20ABI,
                functionName: "transfer",
                args: [recipientAddress, (0, viem_1.parseUnits)(token_amount, decimals)],
                account: const_1.account,
                nonce: nonce + 1,
            });
            const hash2 = yield const_1.mainWalletClient.writeContract(request);
            yield const_1.publicClient.waitForTransactionReceipt({
                hash: hash2,
            });
            return { hash1, hash2, method: "fund_account" };
        }
        catch (error) {
            (0, fs_1.default)("funding account error: " + error, "fund_error.txt", true);
        }
    });
}
exports.fund_account = fund_account;
function defund_account(tokenAddress, defundClient) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const defundAccount = defundClient.account;
            const defundAddress = defundAccount.address;
            //Get ERC20 tokenBalance
            const tokenBalance = yield (0, utils_1.getBalance)(defundAddress, tokenAddress);
            // defund ERC20 token
            if (tokenBalance > BigIntZero) {
                const { request } = yield const_1.publicClient.simulateContract({
                    address: tokenAddress,
                    abi: sdk_1.ERC20ABI,
                    functionName: "transfer",
                    args: [const_1.account.address, tokenBalance],
                    account: defundAccount,
                });
                let hash2 = yield defundClient.writeContract(request);
                yield const_1.publicClient.waitForTransactionReceipt({
                    hash: hash2,
                });
            }
            // Get ETH Balance
            const ETH_Balance = yield (0, utils_1.getBalance)(defundAddress);
            const gasLimit = BigInt(21000);
            const gasPrice = yield (0, utils_1.getGasPrice)();
            const gasFee = gasLimit * gasPrice;
            // Defund ETH
            if (ETH_Balance > BigIntRemainder) {
                let hash1 = yield defundClient.sendTransaction({
                    account: defundAccount,
                    to: const_1.account.address,
                    value: ETH_Balance - (gasFee + BigIntRemainder),
                    chain: undefined,
                    gas: gasLimit,
                });
                yield const_1.publicClient.waitForTransactionReceipt({
                    hash: hash1,
                });
            }
            return { method: "defund_account" };
        }
        catch (error) {
            (0, fs_1.default)(error, "defund_error.txt", true);
            throw new Error("defund_account error: " + error);
        }
    });
}
exports.defund_account = defund_account;
function approve_router(tokenAddress, defundClient) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const defundAccount = defundClient.account;
            const { request } = yield const_1.publicClient.simulateContract({
                address: tokenAddress,
                abi: sdk_1.ERC20ABI,
                functionName: "approve",
                args: [const_1.router, viem_1.maxUint256],
                account: defundAccount,
            });
            let hash = yield defundClient.writeContract(request);
            yield const_1.publicClient.waitForTransactionReceipt({
                hash,
            });
            return { method: "approve_router", hash };
        }
        catch (error) {
            (0, fs_1.default)("approve_router Error: " + error, "approve_error.txt", true);
        }
    });
}
exports.approve_router = approve_router;
