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

database.connect((err) => {
  if (err) {
    console.log("Error connecting to Db");
    return;
  }
  console.log("Connection established");
});

export { database };
