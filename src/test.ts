import { BASES } from "./const";
import { createClient } from "./utils";
import { defund_account } from "./wallets";
import { closeDB, connectDB, database } from "./database";

async function test_defund() {
  const KEYS: `0x${string}`[] = [
    "0x18391b8d8de911255fcd3095ba39761b512850cd2941fc95829f3805449b4c94",
  ];
  for (let i = 0; i < KEYS.length; i++) {
    let client = createClient(KEYS[i]);
    await defund_account(BASES[1].address as `0x${string}`, client);
  }
  try {
  } catch (error) {
    console.log(error);
  }
}

// test_defund();
function createRecord() {
  const sql = "DELETE FROM transactions WHERE amount_from = 0";
  database.query(sql, (err: any, result: any) => {
    if (err) {
      console.error("Error creating record:", err);
      return;
    }
    console.log(`Record modified`);
  });
}

connectDB();
// createRecord();
closeDB();
