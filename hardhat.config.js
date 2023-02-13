require("@nomiclabs/hardhat-waffle");
require('solidity-coverage')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.11'
      },
      {
        version: '0.8.13'
      }
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
    overrides: {
      "contracts/GNFTFactory.sol": {
        version: "0.8.13",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        }
      },
      "contracts/GBTFactory.sol": {
        version: "0.8.13",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        }
      },
      "contracts/XGBTFactory.sol": {
        version: "0.8.13",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        }
      },
      "contracts/GumBallFactory.sol": {
        version: "0.8.13",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        }
      },
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {      
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 300000,
  },
};