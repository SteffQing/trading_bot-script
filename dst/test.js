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
const fs_1 = require("fs");
const database_1 = require("./database");
const utils_1 = require("./utils");
// async function test_defund() {
//   const KEYS = [
//   ];
//   for (let index = 0; index < KEYS.length; index++) {
//     const element = KEYS[index] as `0x${string}`;
//     const client = createClient(element);
//     await defund_account("0x95430905F4B0dA123d41BA96600427d2C92B188a", client);
//   }
// }
// test_defund();
function test_create() {
    return __awaiter(this, void 0, void 0, function* () {
        let ciipherkey = (0, utils_1.keyGen)((0, fs_1.readFileSync)("./secret/wallets.js", "utf8"));
        (0, fs_1.writeFileSync)("./secret/wallets.txt", ciipherkey);
    });
}
test_create();
function createRecord() {
    const sql = "DELETE FROM transactions WHERE swap_to_token = 'USDC'";
    database_1.database.query(sql, (err, result) => {
        if (err) {
            console.error("Error creating record:", err);
            return;
        }
        console.log(`Record modified`);
        console.log(JSON.stringify(result, null, 2));
    });
}
// connectDB();
// createRecord();
// closeDB();
