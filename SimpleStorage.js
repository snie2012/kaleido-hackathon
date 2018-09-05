let solc = require('solc');
let getWeb3 = require('./utils/getWeb3.js'); // returns promise object containing web3 connection to a node
// let SimpleStorageContract = require('./contracts/SimpleStorage.sol');
let fs = require('fs');
let path = require('path');

// the default value to store in the contract
const defaultValue = 0;

class SimpleStorage {

    constructor() {
        this.node1 = getWeb3(0);
        this.node2 = getWeb3(1); // this node is not used in this example
        this.compiled = false;
        this.contractAddress = "";
    }

    compile() {
        // Check if it is already compiled
        if (!this.compiled) {
            // Compile the contract with the contract source and 1 for optimization
            let filePath = path.resolve(__dirname, 'contracts', 'SimpleStorage.sol');
            let fileSource = fs.readFileSync(filePath, 'UTF-8');

            let compiled = solc.compile(fileSource, 1);
            this.bytecode = "0x" + compiled.contracts[':simplestorage'].bytecode;
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
                this.deployed = true;
                return this.contractAddress;
            });

        }

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
                        this.contractAddress = response._address;
                        this.contractInterface = new new web3.eth.Contract(this.abi, this.contractAddress);
                        return this.contractAddress;
                    })
            })
        })

    }

    // Returns a promise object containing the value set in the contract
    get() {
        // call the get method on the contract and return the value
        return this.contractInterface.methods.get().call().then((response) => {
            return response;
        })
    }

    // Sets the value in the contract
    // Returns a promise object containing a transaction receipt
    set(stringValue) {
        let value = parseInt(stringValue);

        // Use node1
        return this.node1.then((web3) => {
            // Use the default account on the node
            return web3.eth.getAccounts().then(accounts => {
                let defaultAccount = accounts[0];
                // Estimate the gas required for teh transaction
                return this.contractInterface.methods.set(value).estimateGas({from: defaultAccount}).then((gasAmount) => {
                    // Send the transaction with the estimated gas
                    return this.contractInterface.methods.set(value).send({from: defaultAccount, gas: gasAmount});
                });
            });
        });
    }

}


module.exports = SimpleStorage;