import mysql from "mysql";
import { config } from "dotenv";

config();

const { DB_HOST, DB_USER, DB_NAME, DB_PASSWORD } = process.env;

const database = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

function connectDB() {
  database.connect((err) => {
    if (err) {
      throw new Error("Error connecting to Db" + err);
    }
    console.log("Connection established");
  });
}

function closeDB() {
  database.end((err) => {
    if (err) {
      throw new Error("Error closing Db" + err);
    }
    console.log("Connection closed");
  });
}

function insertDB(sql: string, values: any[]) {
  return new Promise((resolve, reject) => {
    database.query(sql, values, (err, result) => {
      if (err) {
        throw new Error("Error inserting into DB" + err);
      }
      resolve(result);
    });
  });
}

var traders_sql =
  "INSERT INTO traders (private_key, wallet_address) VALUES (?,?)";
var txn_sql =
  "INSERT INTO transactions (tx_hash, wallet_address, swap_from_token, swap_to_token, amount_from, amount_to, time) VALUES (?,?,?,?,?,?,?)";

export { connectDB, closeDB, insertDB, traders_sql, txn_sql };
