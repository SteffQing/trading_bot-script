import { WalletClient, formatUnits } from "viem";
import { BASES } from "./const";
import { createClient } from "./utils";
import {
  gen_key,
  fund_account,
  defund_account,
  approve_router,
} from "./wallets";
import log from "./fs";
import { connectDB, closeDB, insertDB, traders_sql } from "./database";
import { writeFileSync } from "fs";

const [WETH, USDC] = BASES;

interface AssetParams {
  [symbol: string]: {
    min: number;
    max: number;
  };
}

async function run(params: AssetParams, loop: number = 15) {
  const CLIENTS: WalletClient[] = [];
  const PRIVATE_KEYS: string[] = [];

  try {
    await connectDB();

    for (let i = 0; i < loop; i++) {
      // Generate new key and client, fund and add to array
      let privateKey = gen_key();
      PRIVATE_KEYS.push(privateKey);

      const client = createClient(privateKey);
      CLIENTS.push(client);

      let address = client.account.address;

      let trader_data = [privateKey, address];
      insertDB(traders_sql, trader_data);

      await fund_account({
        tokenAddress: USDC.address as `0x${string}`,
        decimals: USDC.decimals,
        eth_amount: params[WETH.symbol!].max.toString(),
        token_amount: params[USDC.symbol!].max.toString(),
        recipientAddress: address,
      });

      await approve_router(USDC.address as `0x${string}`, client);
    }

    const arrayAsString = JSON.stringify(PRIVATE_KEYS);

    // Write the string to a file
    writeFileSync("./data/wallets.js", arrayAsString);

    log("Init Script completed successfully!");
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
  } finally {
    await closeDB();
  }
}

const assetParams = {
  [WETH.symbol!]: {
    min: 0.1,
    max: 0.2,
  },
  [USDC.symbol!]: {
    min: 0.1,
    max: 0.4,
  },
};

run(assetParams).catch((error) => {
  console.error("init error", error);
  process.exit(1);
});
