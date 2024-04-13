import { generatePrivateKey } from "viem/accounts";
import { account, mainWalletClient, publicClient, router } from "./const";
import {
  Account,
  WalletClient,
  maxUint256,
  parseEther,
  parseUnits,
} from "viem";
import { ERC20ABI } from "@traderjoe-xyz/sdk";
import { getGasPrice, getNonce, getBalance } from "./utils";
import log from "./fs";

function gen_key() {
  const privateKey = generatePrivateKey();

  log(privateKey, './wallets.txt')
  return privateKey;
}

const BigIntZero = BigInt(0);
const BigIntRemainder = parseEther("0.000105");

interface AccountFunding {
  tokenAddress: `0x${string}`;
  decimals: number;
  eth_amount: string;
  token_amount: string;
  recipientAddress: `0x${string}`;
}

async function fund_account(params: AccountFunding) {
  const { tokenAddress, decimals, eth_amount, token_amount, recipientAddress } =
    params;
  // TODO
  // : Implement funding account logic based on current gas prices

  try {
    // Fund with ETH
    const hash1 = await mainWalletClient.sendTransaction({
      to: recipientAddress,
      value: parseEther(eth_amount),
    });
    // const receipt = await publicClient.waitForTransactionReceipt({
    //   hash: hash1,
    // });
    // Fund with ERC20 token
    let nonce = await getNonce(account.address);
    const { request } = await publicClient.simulateContract({
      address: tokenAddress,
      abi: ERC20ABI,
      functionName: "transfer",
      args: [recipientAddress, parseUnits(token_amount, decimals)],
      account,
      nonce: nonce + 1,
    });
    const hash2 = await mainWalletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({
      hash: hash2,
    });
    return { hash1, hash2, method: "fund_account" };
  } catch (error) {
    log("funding account error: " + error);
  }
}

async function defund_account(
  tokenAddress: `0x${string}`,
  defundClient: WalletClient
) {
  try {
    const defundAccount = defundClient.account as Account;
    const defundAddress = defundAccount.address;

    //Get ERC20 tokenBalance
    const tokenBalance = await getBalance(defundAddress, tokenAddress);
    // defund ERC20 token
    if (tokenBalance > BigIntZero) {
      const { request } = await publicClient.simulateContract({
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: "transfer",
        args: [account.address, tokenBalance],
        account: defundAccount,
      });
      let hash2 = await defundClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({
        hash: hash2,
      });
    }

    // Get ETH Balance
    const ETH_Balance = await getBalance(defundAddress);
    const gasLimit = BigInt(21000);
    const gasPrice = await getGasPrice();
    const gasFee = gasLimit * gasPrice;
    // Defund ETH
    if (ETH_Balance > BigIntRemainder) {
      let hash1 = await defundClient.sendTransaction({
        account: defundAccount,
        to: account.address,
        value: ETH_Balance - (gasFee + BigIntRemainder),
        chain: undefined,
        gas: gasLimit,
      });
      await publicClient.waitForTransactionReceipt({
        hash: hash1,
      });
    }
    return { method: "defund_account" };
  } catch (error) {
    log(error)
    throw new Error("defund_account error: " + error);
  }
}

async function approve_router(
  tokenAddress: `0x${string}`,
  defundClient: WalletClient
) {
  try {
    const defundAccount = defundClient.account as Account;

    const { request } = await publicClient.simulateContract({
      address: tokenAddress,
      abi: ERC20ABI,
      functionName: "approve",
      args: [router, maxUint256],
      account: defundAccount,
    });

    let hash = await defundClient.writeContract(request);

    await publicClient.waitForTransactionReceipt({
      hash,
    });

    return { method: "approve_router", hash };
  } catch (error) {
    log("approve_router Error: " + error);
  }
}

export { gen_key, fund_account, defund_account, approve_router };
