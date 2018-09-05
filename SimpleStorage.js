let solc = require('solc');
let getWeb3 = require('./getWeb3.js'); // returns promise object containing web3 connection to a node
let SimpleStorageContract = require('SimpleStorage.sol');

class SimpleStorage {

    constructor() {
        this.node1 = getWeb3(1);
        this.node2 = getWeb3(2); // this node is not used in this example
        this.compiled = false;
        this.contractAddress = "";
    }

    compile() {
        // Check if it is already compiled
        if (!this.compiled) {
            // Compile the contract with the contract source and 1 for optimization
            let compiled = solc.compile(SimpleStorageContract, 1);
            console.log(compiled.contracts);
            this.bytecode = compiled.contracts['SimpleStorage'].bytecode;
            this.abi = compiled.contracts['SimpleStorage'].abi; // this is a json object that web3 uses as an interface
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

        this.node1.then((web3) => {
            let contract = new web3.eth.Contract(this.abi);
            console.log("Getting defualt account from node1 to deploy new contract");
            return web3.eth.getAccounts().then((accounts) => {
                console.log("Deploying new contract from address: " + accounts[0]);
                return contract.deploy({data: this.bytecode}).send({
                    data: this.bytecode,
                    from: accounts[0],
                    gasPrice: 0,
                    gas: 2000000
                }).then((response) => {
                        this.contractAddress = response._address;
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
    set(value) {
        // Use node1
        return this.node1.then((web3) => {
            // Use the default account on the node
            return web3.eth.getAccounts().then(accounts => {
                let defaultAccount = accounts[0];
                // Estimate the gas required for teh transaction
                return this.contractInterface.methods.set(value).estimateGas({from: defaultAccount}).then((gasAmount) => {
                    // Send the transaction with the estimated gas
                    return this.contractInterface.methods.set(value).estimateGas({from: defaultAccount, gas: gasAmount});
                });
            });
        });
    }

}


module.exports = SimpleStorage;