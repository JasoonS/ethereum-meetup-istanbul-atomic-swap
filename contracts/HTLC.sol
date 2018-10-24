pragma solidity ^0.4.23;

contract HTLC {

    bytes32 public hashedSecret;
    address public destination;
    uint public timeOut;
    address issuer;

    constructor(bytes32 _hashedSecret, address _destination, uint256 duration) {
      hashedSecret = _hashedSecret;
      destination = _destination;
      issuer = msg.sender;
      timeOut = now + duration;
    }

    modifier onlyIssuer {require(msg.sender == issuer); _; }

    //a string is subitted that is hash tested to the hashedSecret; If true the funds are sent to the destination address and destinationroys the contract
    function claim(string secret) public returns(bool result) {
       require(hashedSecret == keccak256(abi.encodePacked(secret)));
       selfdestruct(destination);
       return true;
    }

    // allow payments
    function () public payable {}

    //if the time expires; the issuer can reclaim funds and destinationroy the contract
    function refund() onlyIssuer public returns(bool result) {
        require(now >= timeOut);
        selfdestruct(issuer);
        return true;
    }
}
