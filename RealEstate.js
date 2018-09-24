const solc = require('solc');
const fs = require('fs');
const path = require('path');
const Web3 = require('web3');
let getWeb3 = require('./utils/getWeb3.js'); // returns promise object containing web3 connection to a node

// the default value to store in the contract during construction/deployment
const numParticipants = 3;
const names = ["Mountain View", "Beach House", "Skyscrape"].map(name => Web3.utils.fromAscii(name));
const values = [100, 100, 100];

// This serves as a js wrapper class for interacting with the SimpleStorage.sol smart contract
class RealEstate {

    // Instantiates the class, declares some simple properties, and gets web3 communication objects.
    constructor() {
        this.nodes = [];
        for (let i = 0; i < numParticipants; i++) {
            this.nodes.push(getWeb3(i));
        }
        this.defaultNode = this.nodes[0];
        this.compiled = false;
        this.contractAddress = "";
    }

    // Compiles the smart contract in preparation of deployment. Compile must be called before
    // deploying the contract or interacting with its methods. This js object needs the compiled
    // contracts "abi" (application binary interface) in order to interact with it.
    compile() {
        // Check if it is already compiled
        if (!this.compiled) {
            console.log('+++++++++++++++++++');
            let filePath = path.resolve(__dirname, 'contracts', 'RealEstate.sol');
            let fileSource = fs.readFileSync(filePath, 'UTF-8');
            console.log(fileSource);

            let compiled = solc.compile(fileSource, 1);

            this.bytecode = "0x" + compiled.contracts[':RealEstate'].bytecode;
            let contractInterface = compiled.contracts[':RealEstate'].interface;
            this.abi = JSON.parse(contractInterface);
            this.compiled = true;
            console.log('+++++++++++++++++++');
        }
    }

    // This will initialize and deploy a contract if there is no contract address passed in
    // contractAddress should be a valid Ethereum Address containing an instance of this deployed contract
    deploy(contractAddress = null) {
        // if this isn't compiled yet, we need to compile it for the bytecode and web3 interface (abi)
        if (!this.compiled) {
            this.compile();
        }
        // if there is an address passed in then assume that it is already deployed
        if (contractAddress !== null) {
            this.contractAddress = contractAddress;
            return this.defaultNode.then((web3) => {
                this.contractInterface = new web3.eth.Contract(this.abi, this.contractAddress);
                return this.contractAddress;
            });
        }

        // No address provided so let's deploy a new one onto the chain
        return this.defaultNode.then((web3) => {
            let contract = new web3.eth.Contract(this.abi);
            console.log("Getting default account from defaultNode to deploy new contract");
            return web3.eth.getAccounts().then((accounts) => {
                console.log("Deploying new contract from address: " + accounts[0]);
                return contract.deploy({
                    data: this.bytecode,
                    arguments: [names, values]
                }).send({
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

    declareOwnership(houseName, owner) {
        console.log(this);
        var houseName = Web3.utils.fromAscii(houseName);
        console.log("Connecting to node" + owner);
        return this.nodes[parseInt(owner)].then((web3) => {
            console.log("Getting the default account from node" + owner);
            // Use the default account on the node
            return web3.eth.getAccounts().then(accounts => {
                let defaultAccount = accounts[0];
                console.log("Estimating the gas required to set a value");
                // Estimate the gas required for the transaction
                // Ethereum transactions on the chain require an Execution Fee called "gas".
                // This gas is used to pay the miners/node for executing a transaction.
                // In Kaleido's networks, the gas price is set to 0; so while you must specify an amount of gas to use,
                // it doesn't actually cost anything.
                return this.contractInterface.methods.declareOwnership(houseName).estimateGas({ from: defaultAccount }).then((gasAmount) => {
                    console.log("Declaring ownership of " + houseName + " to be node" + owner);
                    // Send the transaction with the estimated gas
                    return this.contractInterface.methods.declareOwnership(houseName).send({ from: defaultAccount, gas: gasAmount });
                });
            });
        });
    }
}

// Export the class for other files to import and use
module.exports = RealEstate;