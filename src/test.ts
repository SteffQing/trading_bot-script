import { BASES } from "./const";
import { createClient } from "./utils";
import { defund_account } from "./wallets";
// import { database } from "./database";

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
