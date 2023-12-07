import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import 'hardhat-gas-reporter';
import 'hardhat-deploy';
import 'solidity-coverage';
import { HardhatUserConfig } from "hardhat/config";
import { HardhatNetworkAccountsUserConfig } from "hardhat/types";

const etherscanConfig = {
  Mainnet: { apiUrl: 'https://api.etherscan.io/', apiKey: process.env.ETHERSCAN_API_KEY || '' },
  Sepolia: { apiUrl: 'https://api-sepolia.etherscan.io/', apiKey: process.env.ETHERSCAN_API_KEY || '' },
}
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.23"
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
  },
  gasReporter: {
    enabled: true,
    coinmarketcap: process.env.COINMARKETCAP_API || '',
    gasPrice: 15,
  },
  typechain: {
    outDir: 'src/types',
    target: 'ethers-v6'
  },
  networks: {
    hardhat: {
      chainId: 1337,
      mining: {
        auto: true,
      },
      gas: 20000000,
      blockGasLimit: 20000000,
      gasPrice: 'auto',
      gasMultiplier: 2,
      hardfork: 'muirGlacier',
      throwOnCallFailures: true,
      throwOnTransactionFailures: true,
      accounts: {
        count: 10,
        accountsBalance: '1000000000000000000000',
      },
    },
    Sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: {
       mnemonic: process.env.DEPLOYER_MNEMONIC || 'test test test test test test test test test test test test '
      } as HardhatNetworkAccountsUserConfig,
      live: true,
      saveDeployments: true,
      verify: { etherscan: etherscanConfig.Sepolia },
    },
  }
};

export default config;
