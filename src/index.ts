import { WalletClient } from "viem";
import { BASES, createClient } from "./const";
import { trade, getRoute } from "./trade";
import { gen_key, fund_account, defund_account } from "./wallets";

interface BotInterface {
  loop: number;
  min: number;
  max: number;
}
async function run(params: BotInterface) {
  try {
    const { loop, min, max } = params;
    validateInputs(params);
    // token initializations
    const USDC = BASES[1];

    const CLIENTS: WalletClient[] = [];
    const loopCount = loop * 10;

    const InToken: { [key: `0x${string}`]: number } = {};

    for (let i = 0; i < loopCount; i++) {
      if (CLIENTS.length === loop) {
        const oldClient = CLIENTS.shift();
        await defund_account(USDC.address as `0x${string}`, oldClient!);
      }
      // Generate new key and client, fund and add to array
      let privateKey = gen_key();
      const client = createClient(privateKey);
      let address = client.account.address;
      await fund_account({
        tokenAddress: USDC.address as `0x${string}`,
        decimals: USDC.decimals,
        amount: max.toString(),
        recipientAddress: address,
      });
      // Get random number between 0 and 1 to determine inputToken
      let index = getRandomNumber(0, 1);
      InToken[address] = index;

      CLIENTS.push(client);

      for (let j = 0; j < CLIENTS.length; j++) {
        // Actually call trades on each client
        let amount = getRandomNumber(min, max).toString();
        let currentClient = CLIENTS[j];
        let currentAddress = currentClient.account?.address as `0x${string}`;

        let tokenIndex = InToken[currentAddress];
        let inputToken = BASES[tokenIndex];
        let outputToken = BASES[(tokenIndex + 1) % 2];
        InToken[currentAddress] = tokenIndex === 0 ? 1 : 0;

        let [isNativeIn, isNativeOut] = [tokenIndex === 0, tokenIndex === 1];
        let routeParams = {
          amount,
          inputToken,
          outputToken,
          isNativeIn,
          isNativeOut,
        };
        let route = getRoute(routeParams);
        let txnHash = await trade(currentClient, route);
      }
    }
  } catch (error) {
    throw new Error("Error");
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
  if (!Number.isInteger(min) || min <= 0) {
    throw new Error("min must be a non-negative integer");
  }
  if (!Number.isInteger(max) || max <= min) {
    throw new Error("max must be greater than or equal to min");
  }
}

async function wait(delay: number = 10000) {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log("10 seconds delay");
      resolve();
    }, delay);
  });
}

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

run({ loop: 3, min: 0.01, max: 0.1 }).catch((error) => {
  console.error(error);
  process.exit(1);
});
