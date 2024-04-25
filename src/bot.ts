import { WalletClient, formatUnits } from "viem";
import { BASES, assetParams } from "./const";
import { trade, getRoute } from "./trade";
import {
  createClient,
  getBalance,
  validateInputs,
  validateWalletsFile,
} from "./utils";
import { fund_account } from "./wallets";
import { Token } from "@traderjoe-xyz/sdk-core";
import log from "./fs";
import { connectDB, closeDB } from "./database";
import { readFileSync } from "fs";

const [WETH, USDC] = BASES;

async function run() {
  const CLIENTS: WalletClient[] = [];
  var PRIVATE_KEYS: `0x${string}`[] = [];
  validateInputs();
  validateWalletsFile();
  try {
    await connectDB();

    const InToken: { [key: `0x${string}`]: number } = {};
    const MaxedOut: { [key: string]: Set<string> } = {};

    const data = readFileSync("./data/wallets.js", "utf8");
    PRIVATE_KEYS = JSON.parse(data);

    PRIVATE_KEYS.forEach((key) => {
      const client = createClient(key);
      CLIENTS.push(client);
      let address = client.account.address;
      let index = getRandomIndex();
      InToken[address] = index;
      MaxedOut[address] = new Set<string>();
    });

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < CLIENTS.length; j++) {
        let currentClient = CLIENTS[j];
        let currentAddress = currentClient.account?.address as `0x${string}`;

        let tokenIndex = InToken[currentAddress];
        let inputToken = BASES[tokenIndex];
        let outputToken = BASES[(tokenIndex + 1) % 2];
        InToken[currentAddress] = tokenIndex === 0 ? 1 : 0;
        let [isNativeIn, isNativeOut] = [tokenIndex === 0, tokenIndex === 1];

        const [min, max] = [
          assetParams[inputToken.symbol!].min,
          assetParams[inputToken.symbol!].max,
        ];

        const newMax = await getMax(currentAddress, inputToken, max);

        if (newMax <= 0.01) {
          MaxedOut[currentAddress].add(inputToken.symbol!);
          if (MaxedOut[currentAddress].size === 2) {
            await fund_account({
              tokenAddress: USDC.address as `0x${string}`,
              decimals: USDC.decimals,
              eth_amount: assetParams[WETH.symbol!].max.toString(),
              token_amount: assetParams[USDC.symbol!].max.toString(),
              recipientAddress: currentAddress,
            });
            MaxedOut[currentAddress].clear();
          }
          continue;
        }

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
    log(`An error occurred: ${err}`, "error.txt");
  } finally {
    await closeDB();
  }
}

function getRandomNumber(min: number, max: number) {
  let newMin = min > max ? 0.01 : min;
  return Math.random() * (max - newMin) + newMin;
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
      ? balance - 0.01
      : balance
    : max;
}

run().catch((error) => {
  console.error("bot error", error);
  process.exit(1);
});
