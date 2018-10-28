const HDWalletProvider = require("truffle-hdwallet-provider")
const { memonic, accessToken } = require('./config.js')

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(memonic, "https://rinkeby.infura.io/" + accessToken)
      },
      network_id: 3
    },
    kovan: {
      provider: function() {
        return new HDWalletProvider(memonic, "https://kovan.infura.io/" + accessToken)
      },
      network_id: 3
    }
  }
};
