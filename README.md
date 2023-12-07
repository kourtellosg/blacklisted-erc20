# Stake to Vote 

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```

# Stake to Vote 

## Intro 

**Challenge:** The company wants to create a platform where users can stake their tokens. This will allow users to participate in (vote)
different Surveys. When a user stakes some amount of a particular token (ex: BAR) it gives them the possibility to vote on any survey
linked to that token (ie: BAR).

## Dev Guide 

To run the project and compile the smart contract you need to: 

```shell
yarn install
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