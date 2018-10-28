const timeManager = require('openzeppelin-solidity/test/helpers/increaseTime')
const currentTime = require('openzeppelin-solidity/test/helpers/latestTime')
const { assertRevert, should, getContractCode } = require("./helpers")
const truffleAssert = require('truffle-assertions')
const { expect } = require('chai')

const GenericToken = artifacts.require('GenericToken')
const HTLC = artifacts.require('HTLC')


contract("GenericToken", (accounts) => {
  let PiedPiperToken
  let HooliToken
  const sender = accounts[0]
  const receiver = accounts[1]

  const gasPrice = 100000000000

  describe('balanceOf', () => {
    before(async () => {

      PiedPiperToken = await GenericToken.new("PiedPiperToken","PPC", 12 , 1e27, {from: sender})
      HooliToken = await GenericToken.new("HooliToken","HOO", 12 , 1e27, {from: sender})


    })

    it('should return the balance of user. The deployer should have all tokens, initally.', async () => {
      const deployerBalance= await PiedPiperToken.balanceOf.call(sender)
      const totalSupply  = await PiedPiperToken.totalSupply.call()

      totalSupply.should.be.bignumber.equal(deployerBalance)
    })

  })

})

contract("HTLC", (accounts) => {
  let PiedPiperToken
  let HooliToken
  let PiedPiperHTLC
  let HooliHTLC

  let secret = "EthereumMeetupIstanbul"
  let secretHash = web3.sha3(secret);

  const PiedPiper = accounts[0]
  const Hooli = accounts[1]

  const swapPPCAmount = 1e+20
  const swapHOOAmount = 5e+20

  const gasPrice = 100000000000

  describe('fundSwap', () => {
    before(async () => {
      PiedPiperToken = await GenericToken.new("PiedPiperToken","PPC", 12 , 1e27, {from: PiedPiper})
      HooliToken = await GenericToken.new("HooliToken","HOO", 12 , 1e27, {from: Hooli})
      PiedPiperHTLC = await HTLC.new(secretHash, timeManager.duration.days(2) , PiedPiperToken.address, {from:PiedPiper})
      HooliHTLC = await HTLC.new(secretHash, timeManager.duration.days(1) , HooliToken.address, {from:Hooli})

    })

    it('PiedPiper should fund PiedPiperHTLC contract by allowing right to spend amount of swap tokens ', async () => {
      await PiedPiperToken.approve.sendTransaction(PiedPiperHTLC.address, swapPPCAmount, {from:PiedPiper});
      await PiedPiperHTLC.fundSwap.sendTransaction(swapPPCAmount, Hooli, {from:PiedPiper});
      const balanceOfPiedPiperHTLC= await PiedPiperToken.balanceOf.call(PiedPiperHTLC.address)
      balanceOfPiedPiperHTLC.should.be.bignumber.equal(swapPPCAmount)
    })

    it('Hoolie should fund HoolieHTLC contract by allowing right to spend amount of swap tokens ', async () => {
      await HooliToken.approve.sendTransaction(HooliHTLC.address, swapHOOAmount, {from:Hooli});
      await HooliHTLC.fundSwap.sendTransaction(swapHOOAmount, PiedPiper, {from:Hooli});
      const balanceOfFHooliHTLC= await HooliToken.balanceOf.call(HooliHTLC.address)
      balanceOfFHooliHTLC.should.be.bignumber.equal(swapHOOAmount)
    })

  })


  describe('claim', () => {
    before(async () => {
      PiedPiperToken = await GenericToken.new("PiedPiperToken","PPC", 12 , 1e27, {from: PiedPiper})
      HooliToken = await GenericToken.new("HooliToken","HOO", 12 , 1e27, {from: Hooli})
      PiedPiperHTLC = await HTLC.new(secretHash, timeManager.duration.days(2) , PiedPiperToken.address, {from:PiedPiper})
      HooliHTLC = await HTLC.new(secretHash, timeManager.duration.days(1) , HooliToken.address, {from:Hooli})

    })

    it('Both parties should fund their own HTLCs to swap tokens ', async () => {

      await PiedPiperToken.approve.sendTransaction(PiedPiperHTLC.address, swapPPCAmount, {from:PiedPiper})
      const txHashFirst = await PiedPiperHTLC.fundSwap.sendTransaction(swapPPCAmount, Hooli,{from:PiedPiper})
      const resultOfFirstFunding = await truffleAssert.createTransactionResult(PiedPiperHTLC,txHashFirst)
      await truffleAssert.eventEmitted(resultOfFirstFunding,'fundLocked')

      await HooliToken.approve.sendTransaction(HooliHTLC.address, swapHOOAmount, {from:Hooli})
      const txHashSecond = await HooliHTLC.fundSwap.sendTransaction(swapHOOAmount, PiedPiper, {from:Hooli})
      const resultOfSecondFunding  = await truffleAssert.createTransactionResult(HooliHTLC,txHashSecond)
      await truffleAssert.eventEmitted(resultOfSecondFunding,'fundLocked')


    })


    it('PiedPiper should get HooliTokens locked in HooliHTLC', async () => {
      await HooliHTLC.claim.sendTransaction(secret,{from:PiedPiper})
      const balanceOfPiedPiper = await  HooliToken.balanceOf.call(PiedPiper)

      balanceOfPiedPiper.should.be.bignumber.eq(swapHOOAmount)

    })

    it('Hooli should get PiedPiperTokens locked in PiedPiperHTLC', async () => {
      await PiedPiperHTLC.claim.sendTransaction(secret,{from:Hooli})
      const balanceOfHooli = await  PiedPiperToken.balanceOf.call(Hooli)

      balanceOfHooli.should.be.bignumber.eq(swapPPCAmount)

    })


  })


})
