import { readFileSync, writeFileSync } from "fs";
import { closeDB, connectDB, database } from "./database";
import { createClient, decryptKey, keyGen } from "./utils";
import { defund_account, gen_key } from "./wallets";

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

async function test_create() {
  let ciipherkey = keyGen(readFileSync("./secret/wallets.js", "utf8"));
  writeFileSync("./secret/wallets.txt", ciipherkey);
}

// test_create();

function createRecord() {
  const sql =
    "DELETE FROM transactions WHERE swap_to_token = 'USDC' OR swap_from_token = 'USDC'";
  database.query(sql, (err: any, result: any) => {
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
