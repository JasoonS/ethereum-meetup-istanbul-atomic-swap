const instanceConnector = require('./instanceConnector')
const { memonic, accessToken } = require('./config.js')

const contractAddress = process.env.CONTRACT_ADDRESS
const httpProvider = "https://" + process.env.NETWORK + ".infura.io/" + accessToken

const { htlcInstance, web3, provider } = await instanceConnector(contractAddress, httpProvider)

console.log('you are listening to `Claimed` events from the HTLC contract at:', contractAddress, 'on netork', process.env.NETWORK
)

c20Instance.Claimed(
  {}, { fromBlock: 0, toBlock: 'latest' }
).watch ( (err, response) => {
  console.log(response)
})
