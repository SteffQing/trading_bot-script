# Trading Bot Script

This trading bot is designed to function with the TraderJoe SDK to buy and sell a specific asset in a recurring loop as set by the initiator. The bot is designed to be run on a server and will run until the loop raised to its power is ended or it errors out for any reason.


The Bot is funded from a main account passed via the PRIVATE_KEY in the .env file (without the 0x) which funds other generated wallets to be used for trading. The bot will then use the generated wallets to trade the asset in the loop.


The bot will buy the asset and sell it at the market price. The bot will also check the balance of the asset in the wallet and trade it within the margin of the balance to set amount.


In the case of an error, all trading wallets aree defunded and the bot will stop trading. If in the course of defunding, there is an error, the script creates an error log file with that set time/date in UNIX format, detailing the cause of the error and indicating the private keys yet to be defunded for manual action.

## Getting Started
As a prerequisite, you need to have the following installed on your machine:
- Node.js
- npm


### Installation
To install the dependencies, run the following command in the root directory of the project:
```bash
npm install
```

### Overview
The bot is written in TypeScript and needs to be compiled down to JavaScript to run it


the source files are in the src folder and the compiled files are in the dst folder


The const values in the const.ts file are the parameters that need to be set for the bot to run. The parameters are as follows:

- `assetParams` which is an object with two keys. `WETH` and `TOKEN/USDC`
    - `WETH/TOKEN` which is an object with the following keys:
        - `min` minimum amount of the asset to be traded. `min` must be greater than or equal to 0.01
        - `max` maximum amount of the asset to be traded and initially funded. `max` must be greater than `min`
- `wallets_count` this variable is the number of wallets to be generated for trading


No other variable in the const.ts file needs to be changed for the bot to run properly

## Running the script
Now, there are 3 main commands and files in the project that you need to be aware of:
- `init.ts` is the opening file to starting the bot. It handles the generation, funding, router approval and storage of the wallet addresses or traders. It is required that this file is run before the bot can be run:
  - To run the file, use the following command:
    ```bash
    npm run init
    ```
- `bot.ts` is the file that starts the bot. It handles the trading of the asset in a 10 count loop. It is required that the `init.ts` file is run before this file can be run:
  - To run the file, use the following command:
    ```bash
    npm run bot
    ```
- `stop.ts` is the file that stops the bot. It handles the defunding of the wallets:
  - To run the file, use the following command:
    ```bash
    npm run stop
    ```
- `start` A command that runs all 3 commands in a sequence:
  - To run the file, use the following command:
    ```bash
    npm run start
    ```

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details


# Trading Bot Script
