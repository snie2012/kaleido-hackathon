const Web3 = require('web3');
const fs = require("fs");

// Function for reading the app credentials from the keystore file
function getCredentials(node) {

    // If no keystore file found, we can't connect to any node
    let filepath = __dirname + "/../.data/credentials.json";
    if (!fs.existsSync(filepath)) {
        return;
    }

    let data = fs.readFileSync(filepath);

    let keyfile = JSON.parse(data);

    return keyfile.nodes[node];

}

// Returns an instance of web3 for node communication
// @param node is an int specifying the index of the node you want to communicate with. ex. 1, 2, etc.
function getWeb3(node) {
    return new Promise(function(resolve, reject) {

        let credentials = getCredentials(node);

        if (!credentials) {
            reject("Invalid credentials file!");
        }
        // URL format "https://<username>:<password>@xxxxxxxxxx-xxxxxxxxxx-rpc.us-east-2.kaleido.io"
        let url = 'https://' + credentials.username + ':' + credentials.password + '@'
            + credentials.url.substring(8); // substring removes "https://"

        // Set the httpProvider with the rpc endpoint
        // for websocket (wss) use WebsocketProvider
        let provider = new Web3.providers.HttpProvider(url);
        let web3 = new Web3(provider);
        resolve(web3);
    });
}

module.exports = getWeb3;