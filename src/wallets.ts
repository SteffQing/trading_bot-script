import { generatePrivateKey } from "viem/accounts";
import {
  CHAIN_ID,
  account,
  mainWalletClient,
  publicClient,
  router,
} from "./const";
import {
  Account,
  WalletClient,
  maxUint256,
  parseEther,
  parseUnits,
} from "viem";
import { ERC20ABI } from "@traderjoe-xyz/sdk";
import { getGas, getNonce, wait } from "./utils";

function gen_key() {
  const privateKey = generatePrivateKey();
  return privateKey;
}

const BigIntZero = BigInt(0);

interface AccountFunding {
  tokenAddress: `0x${string}`;
  decimals: number;
  amount: string;
  recipientAddress: `0x${string}`;
}
async function fund_account(params: AccountFunding) {
  const { tokenAddress, decimals, amount, recipientAddress } = params;
  // TODO
  // : Implement funding account logic based on current gas prices

  try {
    // Fund with ETH
    const hash1 = await mainWalletClient.sendTransaction({
      to: recipientAddress,
      value: parseEther(amount),
    });
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: hash1,
      confirmations: 3,
    });
    // Fund with ERC20 token
    let nonce = await getNonce(account.address);
    const { request } = await publicClient.simulateContract({
      address: tokenAddress,
      abi: ERC20ABI,
      functionName: "transfer",
      args: [recipientAddress, parseUnits(amount, decimals)],
      account,
      nonce: nonce + 1,
    });
    const hash2 = await mainWalletClient.writeContract(request);
    const receipt2 = await publicClient.waitForTransactionReceipt({
      hash: hash2,
      confirmations: 3,
    });
    return { hash1, hash2, method: "fund_account" };
  } catch (error) {
    throw new Error("funding account error: " + error);
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
    const tokenBalance = (await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20ABI,
      functionName: "balanceOf",
      args: [defundAddress],
    })) as bigint;
    // defund ERC20 token
    if (tokenBalance.toString() !== "0") {
      const { request } = await publicClient.simulateContract({
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: "transfer",
        args: [account.address, tokenBalance],
        account: defundAccount,
      });
      let hash2 = await defundClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: hash2,
        confirmations: 3,
      });
    }

    // Get ETH Balance
    const ETH_Balance = await publicClient.getBalance({
      address: defundAddress,
    });
    const gas = await getGas(account, defundAddress, ETH_Balance);
    // Defund ETH
    console.log(`*Important Log of Balances* 
    GAS: ${gas}
    ETHER: ${ETH_Balance}
    USDC: ${tokenBalance}
    *Types of Balances*
    GAS type: ${typeof gas}
    ETHER type: ${typeof ETH_Balance}
    USDC type: ${typeof tokenBalance}
    
    *Subtract Balance from Gas*
    GAS - ETHER: ${ETH_Balance - gas}
    *BigInt Zero*
    BigInt Zero: ${BigIntZero}
    *Comparison*
    ETH_Balance === BigIntZero: ${ETH_Balance === BigIntZero}
    ETH_Balance > BigIntZero: ${ETH_Balance > BigIntZero}
    ETH_Balance < BigIntZero: ${ETH_Balance < BigIntZero}
    `);
    if (ETH_Balance > BigIntZero) {
      let hash1 = await defundClient.sendTransaction({
        account: defundAccount,
        to: account.address,
        value: ETH_Balance - gas,
        chain: undefined,
      });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: hash1,
        confirmations: 3,
      });
    }
    return { method: "defund_account" };
  } catch (error) {
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
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 3,
    });

    return { method: "approve_router", hash };
  } catch (error) {
    throw new Error("approve_router Error: " + error);
  }
}

export { gen_key, fund_account, defund_account, approve_router };
