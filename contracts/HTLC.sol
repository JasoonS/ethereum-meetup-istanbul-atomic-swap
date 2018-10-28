pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract HTLC {

    event fundLocked(address destination, uint256 swapAmount);
    event claimed(string secret);
    bytes32 public hashedSecret;
    address public destination;
    uint public timeOut;
    address issuer;
    StandardToken erc20Token;
    uint256 public swapAmount;

    constructor(bytes32 _hashedSecret, uint256 duration, address _tokenAddress) public {
        hashedSecret = _hashedSecret;
        issuer = msg.sender;
        timeOut = now + duration;
        erc20Token = StandardToken(_tokenAddress);
    }

    modifier onlyIssuer {require(msg.sender == issuer);
        _;}

    function fundSwap(uint256 _swapAmount,address _destination) public{
        swapAmount = _swapAmount;
        destination = _destination;
        require(erc20Token.transferFrom(msg.sender, address(this), _swapAmount), "Failed Token Transfer");
        emit fundLocked(destination, _swapAmount);
    }
    //a string is subitted that is hash tested to the hashedSecret; If true the funds are sent to the destination address and destinationroys the contract
    function claim(string secret) public returns (bool result) {
        require(hashedSecret == keccak256(abi.encodePacked(secret)));
        require(erc20Token.transfer(destination,erc20Token.balanceOf(address(this))));
        emit claimed(secret);
        selfdestruct(destination);
        return true;
    }

    function () public payable {}

    //if the time expires; the issuer can reclaim funds and destinationroy the contract
    function refund() onlyIssuer public returns (bool result) {
        require(now >= timeOut);
        require(erc20Token.transfer(issuer,erc20Token.balanceOf(address(this))));
        selfdestruct(issuer);
        return true;
    }
}
