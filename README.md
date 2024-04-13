# Trading Bot Script

This trading bot is designed to function with the TraderJoe SDK to buy and sell a specific asset in a recurring loop as set by the initiator. The bot is designed to be run on a server and will run until the loop raised to its power is ended or it errors out for any reason.


The Bot is funded from a main account passed via the PRIVATE_KEY in the .env file (without the 0x) which funds other generated wallets to be used for trading. The bot will then use the generated wallets to trade the asset in the loop.


The bot will buy the asset and sell it at the market price. The bot will also check the balance of the asset in the wallet and trade it within the margin of the balance to set amount.


In the case of an error, all trading wallets aree defunded and the bot will stop trading. If in the course of defunding, there is an error, the script creates an error log file with that set time/date in UNIX format, detailing the cause of the error and indicating the private keys yet to be defunded for manual action.

## Getting Started
the bot is written in TypeScript and needs to be compiled down to JavaScript to run it


the source files are in the src folder and the compiled files are in the dst folder


to compile and run the file you need to run the following commands
`npm run start`
This command compiles down the src files to the dst folder and runs the index.js file in the dst folder


The src/index.ts file contains the entry point of the bot. 


The const variables in the index.ts file are the parameters that need to be set for the bot to run. The parameters are as follows:

- `AssetParams` which is an object with two keys. `WETH` and `TOKEN/USDC`
    - `WETH/TOKEN` which is an object with the following keys:
        - `min` minimum amount of the asset to be traded
        - `max` maximum amount of the asset to be traded and initially funded
- `loop` which is the number of times the bot will run before stopping