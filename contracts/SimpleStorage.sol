pragma solidity ^0.4.17;

// Declare a contract
contract simplestorage {

   // variable for storing an unsigned 256-bit integer
   uint public storedData;

   constructor(uint initVal) public {
      storedData = initVal;
   }

   // Sets the value of the stored variable
   function set(uint x) public {
      storedData = x;
   }

   // Gets the value of the stored variable
   function get() public constant returns (uint retVal) {
      return storedData;
   }
}