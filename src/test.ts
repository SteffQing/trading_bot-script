import { ERC20ABI } from "@traderjoe-xyz/sdk";
import { BASES, publicClient } from "./const";
import { createClient, getGasPrice } from "./utils";
import { formatUnits, parseEther, parseUnits } from "viem";
import { defund_account } from "./wallets";
import { database } from "./database";

async function test_defund() {
  const KEYS: `0x${string}`[] = [
    "0x2f03e0799b4ae67c5f6b3e1c513b5cad870b7e606a4835bd2af27d0b2df59a87",
    "0xca90f3f8b28cb2795ff59a0f43fef05d6563692c3e7d4151d84e44ea42cb1376",
    "0x2f783b58047b952f52a4bdf1d625fe90eece5a250a24b7871b2fe166ce3e3dcc",
    "0x45c01a16542bcdc1d66bfad1b1b1cec9d8986d3a78f268eaf54f273660311eda",
    "0x7c6b8638a5393910d94593645a203568a2f42567ebe6890ba77719277adf0836",
    "0x1b28f5f4802c9af7ed0e1bb27b2c692f25d69c693371b2148ba8973900ee1348",
    "0x05db6691a21c901fee9608e031b6ce134e219f4c66c374f6edb9d4e8532528f5",
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
function createRecord(name: string, email: string) {
  const sql = "INSERT INTO users (name, email) VALUES (?, ?)";
  database.query(sql, [name, email], (err: any, result: any) => {
    if (err) {
      console.error("Error creating record:", err);
      return;
    }
    console.log(`New record added with ID: ${result.insertId}`);
  });
}

createRecord("John Doe", "john@example.com");
