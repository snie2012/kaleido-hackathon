const bodyParser = require('body-parser');
const express = require('express');
const RealEstate = new(require('./RealEstate.js'))();
const app = express();

// Uses json as the format for reading request bodies
app.use(bodyParser.json());

// Allow CORS policy to allow anyone to call these endpoints
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// POST testing endpoint for echoing the body of post calls
// You can use this endpoint to ensure the format of your curl requests are correct
// ex: curl -X POST -H "Content-Type: application/json" localhost:3000/echo -d '{"copy": "cat"}'
app.post('/echo', (request, response) => {
    // Same as post call except used for /app endpoint for getting/initializing the backend data
    response.status(200).send(request.body);
});

// POST deploys the SimpleStorage.sol smart contract onto your network.
// ex: curl -X POST -H "Content-Type: application/json" localhost:3000/simplestorage/deploy
// Optionally, you can use a SimpleStorage contract that it already deployed by
// adding the deployed address to the end of the url
// ex. curl -X POST -H "Content-Type: application/json" localhost:3000/simplestorage/deploy/0xafcAfc6F48E23cEF78355A2f6D013310B84c6272
app.post('/realestate/deploy/:address?', (request, response) => {
    let address = request.params.address ? request.params.address : null;
    RealEstate.deploy(address).then((deployedAddress) => {
        return response.status(200).send({ contractAddress: deployedAddress });
    }).catch((error) => {
        console.log("Error in deploy: ", error);
        return response.status(400).send({ errorMessage: JSON.stringify(error) });
    })
});

// POST Sets the value stored in the contact to the value set in the request body
// ex: curl -X POST -H "Content-Type: application/json" localhost:3000/simplestorage/set -d '{"value": "5"}'
app.post('/realestate/declareownership', (request, response) => {
    if (!request.body.owner || !request.body.houseName) {
        return response.status(400).send({ errorMessage: "Values are not set in request body" });
    }
    RealEstate.declareOwnership(request.body.houseName, request.body.owner).then((txReceipt) => {
        return response.status(200).send({ receipt: txReceipt });
    }).catch((error) => {
        console.log(error);
        return response.status(400).send({ errorMessage: JSON.stringify(error) });
    })
});

// Listen on port 3000
app.listen(3000, () => {
    console.log('listening on port 3000');
});