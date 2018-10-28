import Web3 from 'web3'
import HTLC from './build/contracts/HTLC.json'
import contract from 'truffle-contract'

//TODO:: add rabitMQ error message
const getInstance = (htlcContractAddress, httpProvider) => new Promise((resolve, reject) => {
  const htlc = contract(HTLC)

  const provider = new Web3.providers.HttpProvider(httpProvider)
  const web3 = new Web3(provider)

  htlc.setProvider(web3.currentProvider)

  web3.eth.getAccounts(async (error, accounts) => {
    try {
      const htlcInstance = await htlc.at(htlcContractAddress) // TODO:: use `at()` rather, and pass an address as an argument
      resolve({
        provider, web3, accounts, htlcInstance
      })
    } catch (error) {
      console.log('We had an error retriving the contract instance, check if the addresses are correct and that it is deployed to this network:', error)
      reject(error)
    }
  })
})


export default getInstance
