import { closeDB, connectDB, database } from "./database";
import { createClient } from "./utils";
import { defund_account } from "./wallets";

async function test_defund() {
  const KEYS = [
    "0xed3326564445788128d93e1cfc68a4c524243307088b2ee8ca8b42d2d38901a1",
    "0x73522d443a997d24d95fe8728225c951584c5488ce26e5baafa60a79366d1031",
    "0x08c897a2c04dda46e76070fe5657760b942c5fd7ab66f86cce8bc2ac3ef7fba6",
    "0xd1dde324cfcbe64c1682668ef8705105bcb9680585373c6cbfbd08e14097f1e3",
    "0x82ac514193e03b40c61fd063d3088ab514be2e17ddbb8145416538a4bf7e4f27",
    "0x3dc5064823e73bee5e4357c76ebb126ad28f1d9992c73693b487530263c9c171",
  ];

  for (let index = 0; index < KEYS.length; index++) {
    const element = KEYS[index] as `0x${string}`;
    const client = createClient(element);
    await defund_account("0xB6076C93701D6a07266c31066B298AeC6dd65c2d", client);
  }
}

test_defund();

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
