import { BASES } from "./const";
import { createClient } from "./utils";
import { defund_account } from "./wallets";
import { closeDB, connectDB, database } from "./database";
import log from "./fs";

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

// connectDB();
// createRecord();
// closeDB();
