import { WalletClient, formatUnits, parseUnits } from "viem";
import { BASES } from "./const";
import { trade, getRoute } from "./trade";
import { createClient, getBalance } from "./utils";
import {
  gen_key,
  fund_account,
  defund_account,
  approve_router,
} from "./wallets";
import { appendFileSync, writeFileSync } from "fs";
import * as path from "path";

interface BotInterface {
  loop: number;
  min: number;
  max: number;
}
async function run(params: BotInterface) {
  const CLIENTS: WalletClient[] = [];
  const PRIVATE_KEYS: string[] = [];
  try {
    const { loop, min, max } = params;
    // validateInputs(params);
    // token initializations
    const USDC = BASES[1];

    const loopCount = loop * loop;

    const InToken: { [key: `0x${string}`]: number } = {};

    for (let i = 0; i < loopCount; i++) {
      if (CLIENTS.length === loop) {
        const oldClient = CLIENTS.shift();
        await defund_account(USDC.address as `0x${string}`, oldClient!);
        PRIVATE_KEYS.shift();
      }
      // Generate new key and client, fund and add to array
      let privateKey = gen_key();
      PRIVATE_KEYS.push(privateKey);

      const client = createClient(privateKey);
      let address = client.account.address;
      await fund_account({
        tokenAddress: USDC.address as `0x${string}`,
        decimals: USDC.decimals,
        amount: max.toString(),
        recipientAddress: address,
      });

      await approve_router(USDC.address as `0x${string}`, client);

      // Get random number between 0 and 1 for index to determine inputToken
      let index = getRandomIndex();
      InToken[address] = index;

      CLIENTS.push(client);

      for (let j = 0; j < CLIENTS.length; j++) {
        // Actually call trades on each client

        let currentClient = CLIENTS[j];
        let currentAddress = currentClient.account?.address as `0x${string}`;

        let tokenIndex = InToken[currentAddress];
        let inputToken = BASES[tokenIndex];
        let outputToken = BASES[(tokenIndex + 1) % 2];
        InToken[currentAddress] = tokenIndex === 0 ? 1 : 0;
        let [isNativeIn, isNativeOut] = [tokenIndex === 0, tokenIndex === 1];

        let balance: bigint | string | number = await getBalance(
          currentAddress,
          inputToken.address as `0x${string}`
        );
        balance = formatUnits(balance, inputToken.decimals);
        balance = Number(balance);
        const newMax = max >= balance ? balance : max;
        let amount = getRandomNumber(min, newMax).toFixed(2).toString();
        console.log(`Amount: ${amount}
${balance} ${inputToken.symbol}
${newMax}                      `);

        let routeParams = {
          amount,
          inputToken,
          outputToken,
          isNativeIn,
          isNativeOut,
        };
        let route = getRoute(routeParams);
        await trade(currentClient, route);
        // console.log(`Trade completed for ${PRIVATE_KEYS[j]}\n`);
      }
    }
  } catch (err) {
    try {
      for (let i = 0; i < CLIENTS.length; i++) {
        await defund_account(BASES[1].address as `0x${string}`, CLIENTS[i]);
      }
      console.warn("Accounts defunded");
    } catch (error: any) {
      const currentTime = new Date();

      const folderPath = "./error"; // Path to the error folder
      const fileName = `error_log_${currentTime.getTime()}.txt`;
      const filePath = path.join(folderPath, fileName);

      const formattedErrorMsg = `**Error in defund_account:**\n\n${error.toString().replace(/\n/g, "\r\n")}\n\n**Private Keys:**\n\n`;
      writeFileSync(filePath, formattedErrorMsg);

      for (let i = 0; i < PRIVATE_KEYS.length; i++) {
        let account = PRIVATE_KEYS[i];
        appendFileSync(filePath, account + "\n");
      }
      console.error("Error in catch block to defund accounts: ", error);
      throw new Error("defund Error in catch block of main function");
    }

    console.error(err);
    throw new Error("run Error");
  }
}

function validateInputs(params: BotInterface) {
  const { loop, min, max } = params;
  //   if (
  //     typeof tokenIn !== "string" ||
  //     tokenIn.trim() === "" ||
  //     typeof tokenOut !== "string" ||
  //     tokenOut.trim() === ""
  //   ) {
  //     throw new Error("tokenIn and tokenOut must be non-empty strings");
  //   }

  // Validate loop is a positive integer
  if (!Number.isInteger(loop) || loop <= 0) {
    throw new Error("loop must be a positive integer");
  }

  // Validate min/max are positive integers
  if (!Number.isInteger(min) || min < 0) {
    throw new Error("min must be a non-negative integer");
  }
  if (!Number.isInteger(max) || max < min) {
    throw new Error("max must be greater than min");
  }
}

function getRandomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function getRandomIndex() {
  return Math.floor(Math.random() * 2);
}

run({ loop: 3, min: 0.2, max: 1.4 }).catch((error) => {
  console.error("main error", error);
  process.exit(1);
});
