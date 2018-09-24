// This setup file is used to provision resources on the Kaleido platform.
// To change the name or number of resources, you can simply edit the  hacakthon-consortium json
// file, following the existing schema.
// NOTE: if you change the number of nodes or application credentials, you will need to update this file.
const KaleidoSetup = require('consortium-setup-utility/consortium-setup'); // Utility for setting up and accessing Kaleido resources
const hackathonConsortium = require('./config/hackathon-consortium.json'); // Kaleido resources configuration file
const dontRecreateApplicationCredentials = false;
const API_KEY = process.argv[2]; // npm run setup -- "YOUR API KEY HERE"  OR node setup.js "YOUR API KEY HERE"
const fs = require('fs');

// Derived from https://github.com/kaleido-io/frontend-challenge/blob/master/index.js
if (!API_KEY) {
    console.log('\x1b[37m\x1b[41m%s\x1b[0m', '\n  You must provide an API Key to create a consortium  \n');
} else {
    let kaleidoSetup = new KaleidoSetup(API_KEY);
    console.log('Generating Consortium Please Wait....');
    console.log('This may take a few minutes (1-5)');

    kaleidoSetup.setup(hackathonConsortium, dontRecreateApplicationCredentials).then((result)=>{

        console.log('\x1b[30m\x1b[42m%s\x1b[0m', '\n  Consortium successfully setup  \n');
        console.log(JSON.stringify(result, null, 2));

        let credentials = {nodes: []};

        for (let i = 0; i < result.nodes[0].length; i++) {
            let node = {
                url: result.nodes[0][i].urls.rpc,
                username: result.applicationCredentials[0][i].username, 
                password: result.applicationCredentials[0][i].password
            };
            credentials.nodes.push(node);
        }

        // Write the credentials to a hidden file for later use
        !fs.existsSync('.data') && fs.mkdirSync('.data');
        fs.writeFileSync('.data/setup_result.json', JSON.stringify(result));
        fs.writeFileSync('.data/credentials.json', JSON.stringify(credentials));
    }).catch((error) => {
        // Catch and print any errors encountered
        console.log('\x1b[37m\x1b[41m%s\x1b[0m', '\n  An error occurred while setting up the consortium  \n');
        console.log(error.message)
    })
}