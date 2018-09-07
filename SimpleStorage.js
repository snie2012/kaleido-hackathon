const solc = require('solc');
const fs = require('fs');
const path = require('path');
let getWeb3 = require('./utils/getWeb3.js'); // returns promise object containing web3 connection to a node

// the default value to store in the contract during construction/deployment
const defaultValue = 0;

// This serves as a js wrapper class for interacting with the SimpleStorage.sol smart contract
class SimpleStorage {

    // Instantiates the class, declares some simple properties, and gets web3 communication objects.
    constructor() {
        this.node1 = getWeb3(0);
        this.node2 = getWeb3(1); // this node is not used in this example
        this.compiled = false;
        this.contractAddress = "";
    }

    // Compiles the smart contract in preparation of deployment. Compile must be called before
    // deploying the contract or interacting with its methods. This js object needs the compiled
    // contracts "abi" (application binary interface) in order to interact with it.
    compile() {
        // Check if it is already compiled
        if (!this.compiled) {
            // Find the file and read it into memory
            let filePath = path.resolve(__dirname, 'contracts', 'SimpleStorage.sol');
            let fileSource = fs.readFileSync(filePath, 'UTF-8');

            // Compile the contract with the contract source and 1 for optimization
            let compiled = solc.compile(fileSource, 1);

            // Store the bytecode, as we need it for deployment
            this.bytecode = "0x" + compiled.contracts[':simplestorage'].bytecode;

            // Store the abi (application binary interface) for js to interface with the contract on the chain
            let contractInterface = compiled.contracts[':simplestorage'].interface; // this is a json object that web3 uses as an interface
            this.abi = JSON.parse(contractInterface);
            this.compiled = true;
        }
    }

    // This will initialize and deploy a contract if there is no contract address passed in
    // contractAddress should be a valid Ethereum Address containing an instance of this deployed contract
    deploy(contractAddress=null) {
        // if this isn't compiled yet, we need to compile it for the bytecode and web3 interface (abi)
        if (!this.compiled) {
            this.compile();
        }
        // if there is an address passed in then assume that it is already deployed
        if (contractAddress !== null) {
            this.contractAddress = contractAddress;
            return this.node1.then((web3) => {
                this.contractInterface = new web3.eth.Contract(this.abi, this.contractAddress);
                return this.contractAddress;
            });
        }

        // No address provided so let's deploy a new one onto the chain
        return this.node1.then((web3) => {
            let contract = new web3.eth.Contract(this.abi);
            console.log("Getting default account from node1 to deploy new contract");
            return web3.eth.getAccounts().then((accounts) => {
                console.log("Deploying new contract from address: " + accounts[0]);
                return contract.deploy({data: this.bytecode, arguments: [defaultValue]}).send({
                    data: this.bytecode,
                    from: accounts[0],
                    gasPrice: 0,
                    gas: 2000000
                }).then((response) => {
                    //console.log(response);
                    this.contractAddress = response._address;
                    this.contractInterface = new web3.eth.Contract(this.abi, this.contractAddress);
                    return this.contractAddress;
                })
            })
        })

    }

    // Returns a promise object containing the value set in the contract
    get() {
        // call the get method on the contract and return the value
        // this uses call() instead of send() because it is only reading from the chain
        return this.contractInterface.methods.get().call().then((response) => {
            return response;
        })
    }

    // Sets the value in the contract
    // Returns a promise object containing a transaction receipt
    set(stringValue) {
        // Change json string to int value
        let value = parseInt(stringValue);

        console.log("Connecting to node1");
        // Use node1 to send the transaction
        return this.node1.then((web3) => {
            console.log("Getting the default account from node1");
            // Use the default account on the node
            return web3.eth.getAccounts().then(accounts => {
                let defaultAccount = accounts[0];
                console.log("Estimating the gas required to set a value");
                // Estimate the gas required for the transaction
                return this.contractInterface.methods.set(value).estimateGas({from: defaultAccount}).then((gasAmount) => {
                    console.log("Sending the transaction to set a value");
                    // Send the transaction with the estimated gas
                    return this.contractInterface.methods.set(value).send({from: defaultAccount, gas: gasAmount});
                });
            });
        });
    }

}

// Export the class for other files to import and use
module.exports = SimpleStorage;