pragma solidity ^0.4.17;

contract simplestorage {
   uint public storedData;

   constructor(uint initVal) public {
      storedData = initVal;
   }

   function set(uint x) public {
      storedData = x;
   }

   function get() public constant returns (uint retVal) {
      return storedData;
   }
}