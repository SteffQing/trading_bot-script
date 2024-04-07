import { TOKENS } from "./const";
import { trade, getRoute } from "./trade";
import { gen_key, fund_account, defund_account } from "./wallets";

const INTERVAL = 1000 * 10;
async function run(tokenIn: string, tokenOut: string, loop: number) {
  try {
    validateInputs(tokenIn, tokenOut, loop);
    // token initializations
    const inputToken = TOKENS[tokenIn.toLowerCase() as keyof typeof TOKENS];
    const outputToken = TOKENS[tokenOut.toLowerCase() as keyof typeof TOKENS];

    const PRIVATE_KEYS = [];
  } catch (error) {
    throw new Error("Error");
  }
}

function validateInputs(tokenIn: any, tokenOut: any, loop: any) {
  if (
    typeof tokenIn !== "string" ||
    tokenIn.trim() === "" ||
    typeof tokenOut !== "string" ||
    tokenOut.trim() === ""
  ) {
    throw new Error("tokenIn and tokenOut must be non-empty strings");
  }

  // Validate loop is a positive integer
  if (!Number.isInteger(loop) || loop <= 0) {
    throw new Error("loop must be a positive integer");
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
