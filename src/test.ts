import { closeDB, connectDB, database } from "./database";
import { createClient } from "./utils";
import { defund_account } from "./wallets";

// async function test_defund() {
//   const KEYS = []

//   for (let index = 0; index < KEYS.length; index++) {
//     const element = KEYS[index] as `0x${string}`;
//     const client = createClient(element);
//     await defund_account("0xB6076C93701D6a07266c31066B298AeC6dd65c2d", client);
//   }
// }

// test_defund();

function createRecord() {
  const sql = "DELETE FROM transactions WHERE swap_to_token = 'USDC'";
  database.query(sql, (err: any, result: any) => {
    if (err) {
      console.error("Error creating record:", err);
      return;
    }
    console.log(`Record modified`);
    console.log(JSON.stringify(result, null, 2));
  });
}

connectDB();
createRecord();
closeDB();
