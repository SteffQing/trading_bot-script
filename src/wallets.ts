import { generatePrivateKey } from "viem/accounts";
import { account, mainWalletClient, publicClient, CHAIN_ID } from "./const";
import { Account, WalletClient, parseEther, parseUnits } from "viem";
import ERC20ABI from "./ERC20.json";

function gen_key() {
  const privateKey = generatePrivateKey();
  return privateKey;
}

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
    // Fund with ERC20 token
    const { request } = await publicClient.simulateContract({
      address: tokenAddress,
      abi: ERC20ABI,
      functionName: "transfer",
      args: [recipientAddress, parseUnits(amount, decimals)],
      account,
    });
    const hash2 = await mainWalletClient.writeContract(request);
    return { hash1, hash2, method: "fund_account" };
  } catch (error) {
    throw new Error("error in funding account: " + error);
  }
}

async function defund_account(
  tokenAddress: `0x${string}`,
  defundClient: WalletClient
) {
  try {
    const defundAccount = defundClient.account as Account;
    const defundAddress = defundAccount.address;
    // Get ETH Balance
    const ETH_Balance = await publicClient.getBalance({
      address: defundAddress,
    });
    //Get ERC20 tokenBalance
    const tokenBalance = await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20ABI,
      functionName: "balanceOf",
      args: [defundAddress],
    });
    // Defund ETH
    const hash1 = await defundClient.sendTransaction({
      account: defundAccount,
      to: account.address,
      value: ETH_Balance,
      chain: CHAIN_ID as any,
    });
    // defund ERC20 token
    const { request } = await publicClient.simulateContract({
      address: tokenAddress,
      abi: ERC20ABI,
      functionName: "transfer",
      args: [account.address, tokenBalance],
      account: defundAccount,
    });
    const hash2 = await defundClient.writeContract(request);
    return { hash1, hash2, method: "defund_account" };
  } catch (error) {
    throw new Error("Error ");
  }
}

export { gen_key, fund_account, defund_account };
