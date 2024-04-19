import { WalletClient } from "viem";
import { BASES } from "./const";
import { defund_account } from "./wallets";
import log from "./fs";
import { readFileSync } from "fs";
import { createClient } from "./utils";

const [, USDC] = BASES;

async function run() {
  const CLIENTS: WalletClient[] = [];
  let PRIVATE_KEYS: `0x${string}`[] = [];
  try {
    const data = readFileSync("./data/wallets.js", "utf8");
    PRIVATE_KEYS = JSON.parse(data);

    PRIVATE_KEYS.forEach((key) => {
      const client = createClient(key);
      CLIENTS.push(client);
    });

    for (let k = 0; k < CLIENTS.length; k++) {
      await defund_account(USDC.address as `0x${string}`, CLIENTS[k]);
    }

    log("Close Script completed successfully!");
  } catch (err) {
    try {
      for (let i = 0; i < CLIENTS.length; i++) {
        await defund_account(USDC.address as `0x${string}`, CLIENTS[i]);
      }

      log("Accounts defunded");
    } catch (e: any) {
      log(
        `Error in defund accounts: ${e.toString().replace(/\n/g, "\r\n")}`,
        undefined,
        true
      );
    }

    log(err, undefined, true);
  }
}

run().catch((error) => {
  console.error("close error", error);
  process.exit(1);
});
