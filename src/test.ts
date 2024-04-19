import { closeDB, connectDB, database } from "./database";

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
