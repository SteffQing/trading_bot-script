// /api/index.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB, closeDB, fetchDB } = require("../dst/database");
const { formatEther } = require("viem");
const { privateKeyToAddress } = require("viem/accounts");
const { readFileSync } = require("fs");
const { getBalance } = require("../dst/utils");

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
    const data = readFileSync("./data/wallets.js", "utf8");
    const PRIVATE_KEYS = JSON.parse(data);
    let main_account = privateKeyToAddress(`0x${PRIVATE_KEY}`);
    let accounts = PRIVATE_KEYS.map((key) => privateKeyToAddress(key));
    const Accounts = [main_account, ...accounts];

    const Balances = await Promise.all(Accounts.map(getWalletBalance));

    res.json(Balances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Local instance
app.listen(5000, () => {
  console.log("Server listening on port 5000");
});

// Vercel instance
// module.exports = app;
