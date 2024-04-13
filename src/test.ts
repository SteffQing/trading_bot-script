import { BASES } from "./const";
import { createClient } from "./utils";
import { defund_account } from "./wallets";
import { closeDB, connectDB, insertDB } from "./database";

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

test_defund();
// function createRecord(name: string, email: string) {
//   const sql = "INSERT INTO users (name, email) VALUES (?, ?)";
//   database.query(sql, [name, email], (err: any, result: any) => {
//     if (err) {
//       console.error("Error creating record:", err);
//       return;
//     }
//     console.log(`New record added with ID: ${result.insertId}`);
//   });
// }

// createRecord("John Doe", "john@example.com");
var traders_sql =
  "INSERT INTO traders (private_key, wallet_address) VALUES (?,?)";
var txn_sql =
  "INSERT INTO transactions (tx_hash, wallet_address, swap_from_token, swap_to_token, amount_from, amount_to, time) VALUES (?,?,?,?,?,?,?)";

var traders_data = [
  "0x292b26bd920f1a1cfd8eabb74c0d5661116e78113c8e54e9ccfea2b6dc94c3d7",
  "0xbBE57dEB89c7c6595a6FBB17EA01ae34538B1a86",
];
const ct = new Date().toISOString().slice(0, 19).replace("T", " ");
var txn_data = [
  "0x42a824ff105482560e3a0e26724343f27b0627580eaf78490b195c021eed7493",
  "0xbBE57dEB89c7c6595a6FBB17EA01ae34538B1a86",
  "DEGEN",
  "AVAX",
  "100",
  "200",
  ct,
];

connectDB();
insertDB(traders_sql, traders_data);
insertDB(txn_sql, txn_data);
closeDB();
console.log("Database closed");
