const fs = require("fs");
const GenericToken = artifacts.require("./GenericToken.sol");
const HTLC = artifacts.require("./HTLC.sol");
//bytes32 _hashedSecret, uint256 duration, address _tokenAddress
var contractAddress ={};
const initalSupply= 100000;
const duration = 1000;
var secret = "YourSecret";
module.exports = function(deployer) {
  deployer.deploy(GenericToken,"YourTokenName","TICKER",18,initalSupply)
    .then( () => {
      let secretHash = web3.sha3(secret);
      return deployer.deploy(HTLC,secretHash,1000,GenericToken.address)
    });
};


