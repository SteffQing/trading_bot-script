let tokenIndex = 1;
let tokens = ["USDC", "WETH"];
let inputToken = tokenIndex === 0 ? "USDC" : "WETH";
let outputToken = tokenIndex === 1 ? "USDC" : "WETH";
let inputToken1 = tokens[tokenIndex];
let outputToken1 = tokens[(tokenIndex + 1) % tokens.length];
console.log(inputToken, outputToken, inputToken1, outputToken1);
