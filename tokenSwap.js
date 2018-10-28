const Web3 = require('web3');
const web3 = new Web3();
const fs = require('fs');
const BN = web3.utils.BN;

web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545')) ;


const tokenABI = JSON.parse(fs.readFileSync('./build/contracts/GenericToken.json', 'utf8'));
const tokenHTLCABI = JSON.parse(fs.readFileSync('./build/contracts/HTLC.json', 'utf8'));

const tokenAddress = "0x00c9fb6b1adeab94553536ff6e44a69333e34bd2";
const tokenHTLCAddress = "0xd3ea522eef50f765cda3b3cdaf4ec7f1f5e55b5f";


const tokenContract = new web3.eth.Contract(tokenABI.abi,tokenAddress);
const htlcContract = new web3.eth.Contract(tokenHTLCABI.abi,tokenHTLCAddress);



let accountsPromise = new Promise((resolve, reject) => {
  web3.eth.getAccounts().then(arr => {
    resolve(arr);
  });
});

tokenContract.methods.balanceOf(tokenHTLCAddress).call().then(balance => {
  console.log("contract's balance is : ");
  console.log(balance);
});


const tradeAmount = 100;
accountsPromise.then(accounts => {
  let myAccount = accounts[0];
  tokenContract.methods.approve(tokenHTLCAddress,tradeAmount)
    .send({from:myAccount})
    .then(res => console.log(res));

});

accountsPromise.then(accounts => {
  let myAccount = accounts[0];
  tokenContract.methods.balanceOf(myAccount).call().then(balance => {
    console.log("account0's balance is : ");
    console.log(balance);
  });

});

// //(uint256 _swapAmount,address _destination)
// accountsPromise.then(accounts => {
//   let myAccount = accounts[0];
//   let destination = accounts[1];
//   htlcContract.methods.fundSwap(tokenHTLCAddress,destination)
//     .send({from:myAccount})
//     .then(res => console.log(res));
//
// });


// tokenContract.methods.balanceOf(tokenHTLCAddress).call().then(balance => {
//   console.log("contract's balance is : ");
//   console.log(balance);
// });




