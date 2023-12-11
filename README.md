# Blacklist ERC20 

![Coverage](./coverage_badge.svg) [![built-with openzeppelin](https://img.shields.io/badge/built%20with-OpenZeppelin-3677FF)](https://docs.openzeppelin.com/)


## Intro 
This repo contains an extended ERC20 token with the possibility to blacklist wallet addresses. A blacklist wallet cannot transfer tokens but it can receive tokens - this is the desired business logic. It allows any wallet address with the `BLACKLIST_ROLE` to add/remove wallets to/from the blacklist. It also allow for batching the addition/removal of wallets to/from the blacklist.

## Testnet Deployment
You can find a testnet deployment of this ERC20 token in Sepolia on [0xa50851c1392129b84ef045a2ed6e080a03bce144](https://sepolia.etherscan.io/address/0xa50851c1392129b84ef045a2ed6e080a03bce144).

## Development
For compiling the smart contract: 

```shell
yarn build
```

Fot testing the smart contracts:

```shell
yarn test ## just runs the tests
yarn coverage ## runs the test with coverage report
```

For deploying the contracts

```shell
yarn deploy ## deploys the contracts to local network
yarn deploy --network <network_name> ## deploys the contrats to specific network
```

For adding/removing wallet addresses in blacklist:
```shell
## adds a single wallet in blacklist 
## update ./deploy/02-add-to-blacklist.ts with the wallet you want to add
yarn add-to-blacklist 

## removes a single wallet from blacklist 
## update ./deploy/04-remove-from-blacklist.ts with the wallet you want to remove
yarn remove-from-blacklist 

## adds a list of wallets in blacklist using the batch operation
## update ./deploy/03-add-to-blacklist-batch.ts with the list of wallets you want to add
## Same script can be used for batch removing by setting true/false (add/remove) when calling 
yarn batch-add-to-blacklist

## retrieves all the event logs "AddedToBlacklist" and logs list of addresses that are blacklisted
yarn get-all-blacklisted
```

## Gas Report
The gas report can be found [here](./gas-report.txt). It is auto-generated using the `hardhat-gas-reporter` plugin. It retrieves the gas price of the defined network (`GAS_REPORT_NETWORK`) specified in `.env`. It supports Ethereum (`Mainnet`), Polygon and BSC, but more networks can be added, see [here](https://www.npmjs.com/package/hardhat-gas-reporter#token-and-gaspriceapi-options-example) for more info.

Part of the testing was used to realize how much it would cost to add 1000 wallets in the blacklist
Various approaches were used to understand the gas costs associated with it, see (`gas-cost:`) unit tests:
- Single-add of 1000 wallets using `addToBlacklist()`
- Batch-add of 1000 wallets using `multicall()` of `addToBlacklist()`
- Batch-add of 1000 wallets using `batchBlacklist()`

From the tests, it seems that the cheapest option is `batchBlaclist()` which costs a bit more thatn 20$ (gas price: 23 gwei, ETH price: 2238.88 usd/eth).


## :warning: Disclaimer
This repository is not under active development and it was developed for fun. The smart contracts are not audited, therefore not production ready. :warning: Use at your own risk!
