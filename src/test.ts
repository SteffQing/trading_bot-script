import { ERC20ABI } from "@traderjoe-xyz/sdk";
import { publicClient } from "./const";
import { createClient } from "./utils";
import { parseEther, parseUnits } from "viem";

let PK: `0x${string}`[] = [];
async function main() {
  for (let i = 0; i < PK.length; i++) {
    let client = createClient(PK[i]);
    console.log(PK[i], "Done");

    // const { request } = await publicClient.simulateContract({
    //   address: "0xB6076C93701D6a07266c31066B298AeC6dd65c2d",
    //   abi: ERC20ABI,
    //   functionName: "transfer",
    //   args: [
    //     "0xEAe38e8d41aeCC027e1b68c31f7039Ae95651D4D",
    //     parseUnits("0.1", 6),
    //   ],
    //   account: client.account,
    // });
    // await client.writeContract(request);
    await client.sendTransaction({
      to: "0xEAe38e8d41aeCC027e1b68c31f7039Ae95651D4D",
      value: parseEther("0.075"),
    });
  }
}

main();
