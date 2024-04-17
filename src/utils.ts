import { Account, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ERC20ABI } from "@traderjoe-xyz/sdk";
import { BASES, publicClient, chain } from "./const";

function createClient(privateKey: `0x${string}`) {
  const newAccount = privateKeyToAccount(privateKey);
  return createWalletClient({
    account: newAccount,
    chain: chain,
    transport: http(),
  });
}

async function getGas(account: Account, to: `0x${string}`, value: bigint) {
  return await publicClient.estimateGas({
    account,
    to,
    value,
  });
}

async function getGasPrice() {
  return await publicClient.getGasPrice();
}

async function wait(delay: number = 10000) {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      // console.log("10 seconds delay");
      resolve();
    }, delay);
  });
}

async function getNonce(address: `0x${string}`) {
  return await publicClient.getTransactionCount({
    address,
  });
}

async function getApproval(
  route: `0x${string}`,
  account: `0x${string}`,
  tokenAddress: `0x${string}`
) {
  return await publicClient.readContract({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: "allowance",
    args: [account, route],
  });
}

async function getBalance(
  walletAddress: `0x${string}`,
  tokenAddress?: `0x${string}` | undefined
) {
  let balance = BigInt(0);
  if (
    tokenAddress !== undefined &&
    tokenAddress.toLowerCase() !== BASES[0].address.toLowerCase()
  ) {
    balance = (await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20ABI,
      functionName: "balanceOf",
      args: [walletAddress],
    })) as bigint;
  } else {
    balance = await publicClient.getBalance({
      address: walletAddress,
    });
  }
  return balance;
}

export { getApproval, getNonce, createClient, getGas, getBalance, getGasPrice };
