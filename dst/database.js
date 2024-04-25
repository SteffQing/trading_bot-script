"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchDB = exports.database = exports.txn_sql = exports.traders_sql = exports.insertDB = exports.closeDB = exports.connectDB = void 0;
const mysql_1 = __importDefault(require("mysql"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const { DB_HOST, DB_USER, DB_NAME, DB_PASSWORD } = process.env;
const database = mysql_1.default.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
});
exports.database = database;
function connectDB() {
    return new Promise((resolve, reject) => {
        database.connect((err) => {
            if (err) {
                throw new Error("Error connecting to Db" + err);
            }
            else {
                console.log("Connection established");
                resolve("Connection established");
            }
        });
    });
}
exports.connectDB = connectDB;
function closeDB() {
    return new Promise((resolve, reject) => {
        database.end((err) => {
            if (err) {
                throw new Error("Error closing Db" + err);
            }
            else {
                console.log("Connection closed");
                resolve("Connection closed");
            }
        });
    });
}
exports.closeDB = closeDB;
var sql = "SELECT * FROM transactions";
function fetchDB() {
    return new Promise((resolve, reject) => {
        database.query(sql, (err, result) => {
            if (err) {
                throw new Error("Error fetching from DB" + err);
            }
            resolve(result);
            return result;
        });
    });
}
exports.fetchDB = fetchDB;
function insertDB(sql, values) {
    return new Promise((resolve, reject) => {
        database.query(sql, values, (err, result) => {
            if (err) {
                // throw new Error("Error inserting into DB" + err);
                console.error("Error inserting into DB");
            }
            resolve(result);
        });
    });
}
exports.insertDB = insertDB;
var traders_sql = "INSERT INTO traders (private_key, wallet_address) VALUES (?,?)";
exports.traders_sql = traders_sql;
var txn_sql = "INSERT INTO transactions (tx_hash, wallet_address, swap_from_token, swap_to_token, amount_from, amount_to, time) VALUES (?,?,?,?,?,?,?)";
exports.txn_sql = txn_sql;
