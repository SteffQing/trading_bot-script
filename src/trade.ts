import { TokenAmount, Percent, Token } from "@traderjoe-xyz/sdk-core";
import {
  PairV2,
  RouteV2,
  TradeV2,
  TradeOptions,
  jsonAbis,
} from "@traderjoe-xyz/sdk-v2";
import { WalletClient, parseUnits } from "viem";
import { config } from "dotenv";
import { publicClient, BASES, CHAIN_ID, router } from "./const";
import { getNonce } from "./utils";

config();
const { LBRouterV21ABI } = jsonAbis;

interface GetRouteParams {
  amount: string; // e.g. "20", "0.1"
  inputToken: Token;
  outputToken: Token;
  isNativeIn: boolean;
  isNativeOut: boolean;
}
function getRoute(routeParams: GetRouteParams) {
  try {
    const { amount, inputToken, outputToken, isNativeIn, isNativeOut } =
      routeParams;

    // specify whether user gave an exact inputToken or outputToken value for the trade
    const isExactIn = true;

    // parse user input into inputToken's decimal precision, which is 6 for USDC
    const typedValueInParsed = parseUnits(amount, inputToken.decimals);

    // wrap into TokenAmount
    const amountIn = new TokenAmount(inputToken, typedValueInParsed);

    /* Step 5 */
    // get all [Token, Token] combinations
    const allTokenPairs = PairV2.createAllTokenPairs(
      inputToken,
      outputToken,
      BASES
    );

    // init PairV2 instances for the [Token, Token] pairs
    const allPairs = PairV2.initPairs(allTokenPairs);

    // generates all possible routes to consider
    const allRoutes = RouteV2.createAllRoutes(
      allPairs,
      inputToken,
      outputToken
    );

    /* Step 6 */ // Would probably want to pass this in as a variable instead of hardcoding
    // const isNativeIn = true; // set to 'true' if swapping from Native; otherwise, 'false'
    // const isNativeOut = false; // set to 'true' if swapping to Native; otherwise, 'false'

    return {
      allRoutes,
      amountIn,
      outputToken,
      isExactIn,
      isNativeIn,
      isNativeOut,
    };
  } catch (e) {
    console.log(e);
    throw new Error("Error generating routes");
  }
}
interface Route {
  allRoutes: RouteV2[];
  amountIn: TokenAmount;
  outputToken: Token;
  isExactIn: boolean;
  isNativeIn: boolean;
  isNativeOut: boolean;
}
async function trade(walletClient: WalletClient, route: Route) {
  try {
    const account = walletClient.account!;
    const {
      allRoutes,
      amountIn,
      outputToken,
      isExactIn,
      isNativeIn,
      isNativeOut,
    } = route;

    // generates all possible TradeV2 instances
    const trades = await TradeV2.getTradesExactIn(
      allRoutes,
      amountIn,
      outputToken,
      isNativeIn,
      isNativeOut,
      publicClient,
      CHAIN_ID
    );

    // Filter out undefined trades
    const validTrades = trades.filter(
      (trade): trade is TradeV2 => trade !== undefined
    );

    // chooses the best trade
    const bestTrade: TradeV2 | undefined = TradeV2.chooseBestTrade(
      validTrades,
      isExactIn
    );
    if (!bestTrade) {
      throw new Error("No valid trade found");
    }

    /* Step 7 */
    // print useful information about the trade, such as the quote, executionPrice, fees, etc
    // console.log("bestTrade", bestTrade.toLog());

    // get trade fee information
    const { totalFeePct, feeAmountIn } = await bestTrade.getTradeFee();
    console.log("Total fees percentage", totalFeePct.toSignificant(6), "%");
    console.log(
      `Fee: ${feeAmountIn.toSignificant(6)} ${feeAmountIn.token.symbol}`
    );

    // Step 8
    // set slippage tolerance
    const userSlippageTolerance = new Percent("50", "10000"); // 0.5%

    // set swap options
    const swapOptions: TradeOptions = {
      allowedSlippage: userSlippageTolerance,
      ttl: 3600,
      recipient: account.address,
      feeOnTransfer: false, // or true
    };

    // generate swap method and parameters for contract call
    const {
      methodName, // e.g. swapExactTokensForNATIVE,
      args, // e.g.[amountIn, amountOut, (pairBinSteps, versions, tokenPath) to, deadline]
      value, // e.g. 0x0
    } = bestTrade.swapCallParameters(swapOptions);

    // Step 9
    let nonce = await getNonce(account.address);
    console.log(`Nonce: ${nonce}`, account.address);

    const { request } = await publicClient.simulateContract({
      address: router,
      abi: LBRouterV21ABI,
      functionName: methodName,
      args: args,
      account,
      value: BigInt(value),
      nonce: nonce + 1,
    });
    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 3,
    });
    console.log(`Transaction sent with hash ${hash}`);
    return hash;
  } catch (error) {
    console.log(error);
    throw new Error("Error executing trade");
  }
}

export { trade, getRoute };
