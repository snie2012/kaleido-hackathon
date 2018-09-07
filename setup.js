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

        // Log the credentials to the console for the first node
        let url1 = result.nodes[0][0].urls.rpc;
        let username1 = result.applicationCredentials[0][0].username;
        let password1 = result.applicationCredentials[0][0].password;

        console.log('\x1b[37m\x1b[44m%s\x1b[0m', `\n  Connection information (${hackathonConsortium.memberships[0].name} node)  \n`);
        console.log('URL: ' + url1);
        console.log('User: ' + username1);
        console.log('Password: ' + password1);

        let node1 = {url: url1, username: username1, password: password1};
        credentials.nodes.push(node1);

        // Repeat for the second node
        let url2 = result.nodes[0][1].urls.rpc;
        let username2 = result.applicationCredentials[0][1].username;
        let password2 = result.applicationCredentials[0][1].password;

        console.log('\x1b[37m\x1b[44m%s\x1b[0m', `\n  Connection information (${hackathonConsortium.memberships[1].name} node)  \n`);
        console.log('URL: ' + url2);
        console.log('User: ' + username2);
        console.log('Password: ' + password2);

        let node2 = {url: url2, username: username2, password: password2};
        credentials.nodes.push(node2);

        // Write the credentials to a hidden file for later use
        !fs.existsSync('.data') && fs.mkdirSync('.data');
        fs.writeFileSync('.data/credentials.json', JSON.stringify(credentials));
    }).catch((error) => {
        // Catch and print any errors encountered
        console.log('\x1b[37m\x1b[41m%s\x1b[0m', '\n  An error occurred while setting up the consortium  \n');
        console.log(error.message)
    })
}