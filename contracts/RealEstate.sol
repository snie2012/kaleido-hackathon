pragma solidity ^0.4.23;

contract RealEstate {
    struct Transaction {
        address seller;
        address buyer;
        uint price;
    }

    struct House {
        address owner;
        bytes32 name;
        Transaction[] tx_history;
    }

    // Record the list of houses, indexed by names
    mapping (bytes32 => House) public houses;

    // Record the balance of each participant in the market
    mapping (address => uint) public balances;

    // Initialize with a list of houses and their corresponding ownership and value
    constructor(bytes32[] names, uint[] values) public {
        for (uint i = 0; i < names.length; i++) {
            House storage house = houses[names[i]];
            house.name = names[i];
            houses[names[i]] = house;

            // Give each owner a certain amount of money to start
            balances[house.owner] = values[i];
        }
    }

    // Declare ownership for a house at the beginning
    function declareOwnership(bytes32 name) public {
        require(houses[name].owner == address(0), "The house is already owned by others");
        houses[name].owner = msg.sender;
    }

    // Perform a transaction to sell/buy a house
    function buy(bytes32 name, uint price) public {
        require(balances[msg.sender] >= price, "The buyer does not have enough money!");
        require(msg.sender != houses[name].owner, "You cannot buy your own house!");

        // Get the current house info
        House storage house = houses[name];

        // Adjust balance for buyer and seller
        balances[msg.sender] -= price;
        balances[house.owner] += price;
        
        // Change the info for the house in transaction
        house.tx_history.push(Transaction({
            seller: house.owner,
            buyer: msg.sender,
            price: price
        }));
        house.owner = msg.sender;
    }
}