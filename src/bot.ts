import { WalletClient, formatUnits } from "viem";
import { BASES } from "./const";
import { trade, getRoute } from "./trade";
import { createClient, getBalance } from "./utils";
import { defund_account } from "./wallets";
import { Token } from "@traderjoe-xyz/sdk-core";
import log from "./fs";
import { connectDB, closeDB } from "./database";
import { readFileSync } from "fs";

const [WETH, USDC] = BASES;

interface AssetParams {
  [symbol: string]: {
    min: number;
    max: number;
  };
}

async function run(params: AssetParams) {
  const CLIENTS: WalletClient[] = [];
  var PRIVATE_KEYS: `0x${string}`[] = [];
  try {
    await connectDB();

    const InToken: { [key: `0x${string}`]: number } = {};

    const data = readFileSync("./data/wallets.js", "utf8");
    PRIVATE_KEYS = JSON.parse(data);

    PRIVATE_KEYS.forEach((key) => {
      const client = createClient(key);
      CLIENTS.push(client);
      let address = client.account.address;
      let index = getRandomIndex();
      InToken[address] = index;
    });

    for (let i = 0; i < 10; i++) {
      log(`Starting trade ${i + 1}`, "dummy.txt");
      for (let j = 0; j < CLIENTS.length; j++) {
        // Actually call trades on each client

        let currentClient = CLIENTS[j];
        let currentAddress = currentClient.account?.address as `0x${string}`;

        let tokenIndex = InToken[currentAddress];
        let inputToken = BASES[tokenIndex];
        let outputToken = BASES[(tokenIndex + 1) % 2];
        InToken[currentAddress] = tokenIndex === 0 ? 1 : 0;
        let [isNativeIn, isNativeOut] = [tokenIndex === 0, tokenIndex === 1];

        const [min, max] = [
          params[inputToken.symbol!].min,
          params[inputToken.symbol!].max,
        ];

        const newMax = await getMax(currentAddress, inputToken, max);
        let amount = getRandomNumber(min, newMax).toFixed(2).toString();

        let routeParams = {
          amount,
          inputToken,
          outputToken,
          isNativeIn,
          isNativeOut,
        };
        let route = getRoute(routeParams);
        await trade(currentClient, route);
      }
    }
    log("Bot Script completed successfully!");
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

function getRandomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function getRandomIndex() {
  return Math.floor(Math.random() * 2);
}

async function getMax(
  currentAddress: `0x${string}`,
  inputToken: Token,
  max: number
) {
  let balance: bigint | string | number = await getBalance(
    currentAddress,
    inputToken.address as `0x${string}`
  );
  balance = formatUnits(balance, inputToken.decimals);
  balance = Number(balance);

  return max >= balance
    ? inputToken.symbol === WETH.symbol!
      ? balance - balance * 0.1
      : balance
    : max;
}

const assetParams = {
  [WETH.symbol!]: {
    min: 0.1,
    max: 0.2,
  },
  [USDC.symbol!]: {
    min: 1,
    max: 4,
  },
};

run(assetParams).catch((error) => {
  console.error("bot error", error);
  process.exit(1);
});
