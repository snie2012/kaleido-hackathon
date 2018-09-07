// This file serves as a way to connect to a Kaleido node by reading credentials from a file and
// creating an http connection to the node.
const Web3 = require('web3');
const fs = require("fs");

// Function for reading the app credentials from the keystore file
function getCredentials(node) {
    // If no keystore file found, we can't connect to any node
    let filepath = __dirname + "/../.data/credentials.json";
    if (!fs.existsSync(filepath)) {
        console.log("DNE");
        return;
    }

    // Read the keyfile into memory for usage
    let data = fs.readFileSync(filepath);

    // Parse the json into an object
    let keyfile = JSON.parse(data);

    // return the credentials for the desired node
    return keyfile.nodes[node];
}

// Returns a promise object containing an instance of web3 for node communication
// @param node is an int specifying the index of the node in the credentials file
// that you want to communicate with. ex. 0, 1, etc.
function getWeb3(node) {
    return new Promise(function(resolve, reject) {

        let credentials = getCredentials(node);

        // if getCredentials() returns null then the creds file is nonexistent or invalid format
        if (!credentials) {
            reject("Invalid credentials file!");
        }
        // Format the URL for basic authentication
        // URL format "https://<username>:<password>@xxxxxxxxxx-xxxxxxxxxx-rpc.us-east-2.kaleido.io"
        let url = 'https://' + credentials.username + ':' + credentials.password + '@'
            + credentials.url.substring(8); // substring removes "https://"

        // Set the httpProvider with the rpc endpoint and create web3 object
        let provider = new Web3.providers.HttpProvider(url);
        let web3 = new Web3(provider);
        resolve(web3);
    });
}

module.exports = getWeb3;