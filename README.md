# 2018 Kaleido-NCSU Hackathon

Welcome hackathoners!  We're thrilled that you've decided to participate in this joint venture between Kaleido and NC State.  Here is your challenge:

* Come up with a valid industry use case where blockchain technology can add value by delivering additional measures of one or more of the following: security, transparency, efficiency, auditability, identity, immutability and data privacy.  The default Kaleido environments are restricted to three user nodes, so bear this limitation in mind as you brainstorm use cases.  
* Compose a smart contract or series of smart contracts in Solidity or any other EVM compatible language.  We recommend Solidity as it is the most heavily documented.
* Provision a Kaleido environment with at least two user nodes, using a node protocol and consensus algorithm of your choice.  You can choose between Geth + PoA or Quorum + IBFT/Raft.  Quorum allows for private transaction processing if your use case requires the need for data obfuscation.
* Deploy and interact with the contract(s) using a Web3 library (e.g. Web3.js).  Your Web3 layer should expose the available functions in the contracts.  Don't panic, we have an easily-consumable example right here in this repo.  
* Optionally, construct a frontend module that can interact with your backend code and ultimately communicate with the blockchain.  Everyone loves a nice UI, but don't waste too much time on this component.  The emphasis should be on the use case, smart contract and backend code.   
* Compose a README with instructions on how to use your project.

## Prizes
**Actively Hiring for Fulltime and Internship Positions**

	Participation
		- Kaleido Shirts
		- ConsenSys Swag
		- Chance to have your App added to kaleido-io Github as a Example App
		- 5 minute Demo App to Kaleido Core Eng Team at the Cannon Room
		- Networking with Kaleido team

	1st
		- All Things Open tickets: https://allthingsopen.org/
		- Lunch with team and Project debrief with Kaleido Executives
		- Inclusion in our next major announcement
		- Feature in Kaleido Media:
			- Newsletter
			- Social Media
			- Blogpost 

	2nd
		- Amazon Gift Cards
		- Inclusion in our next major announcement
		- Feature in Kaleido Media:
			- Newsletter
			- Social Media
			- Blogpost 

	3rd
		- Starbucks Gift Cards 
		- Inclusion in our next major announcement
		- Feature in Kaleido Media:
			- Newsletter
			- Social Media
			- Blogpost 

## Hackathon Repo

This repo is your starting point and your sounding board.  We've included all the code you need to provision a Kaleido environment and deploy your first solidity smart contract.  Every program is constructed with a minimalist straightforward approach, and each includes heavy documentation in an effort to provide clarity around the Ethereum compatible APIs and Javascript logic.  Feel free to use these pieces as educational resources or even as the scaffolding for your own project.  That's what they're here for...

OK, ready to get going?   Follow these simple instructions and we'll have you up and running in a few minutes.

## Dependencies

Not much, just Node.js to drive the various programs and curl to exercise some basic REST methods.  Optionally, you can also choose to install `jq` to format the JSON output:

* [Node.js](https://nodejs.org/en/download/) - we recommend grabbing the latest LTS version
* [curl](https://curl.haxx.se/download.html) - use the appropriate binary for your OS
* [jq](https://stedolan.github.io/jq/) - A command-line tool that makes reading JSON data easier

## Create your Kaleido Account

This is as easy as it gets.  Visit the [Kaleido Console](https://console.kaleido.io/login/signup?orig_url=/) and follow
the instructions to create an account and Kaleido Org.  The UI is very intuitive, but we also have formal reference documentation
[here](http://console.kaleido.io/docs/docs/createnet/) if you get confused on anything.  Once you've generated your
Kaleido Organization, go ahead and log into the console.  Click the **API** tab at the top of the screen and then click the
**GENERATE API KEY** button.  Provide a name for your key and click **NEXT**.  This will create an administrative security token specific to your Kaleido Org, and allows for the resource creation calls to be conducted via our convenient REST API.  Copy the APIKEY and keep it handy, we'll use it in the next step.

## Getting Started

Navigate to a local working directory on your machine.  Clone this repo and change into it:

```sh
git clone https://github.com/kaleido-io/kaleido-hackathon.git  && cd kaleido-hackathon
```

Next we need to install our dependencies.  Take a peek at `package.json` if you want to see the
libraries we're using:

```sh
npm install
```

Cool.  Now we're ready to deploy a Kaleido environment.  Our friend, `setup.js`, will do all the heavy lifting
and leave you with your very own blockchain network fully equipped with memberships, nodes and security
credentials.  Retrieve that APIKEY from the previous step and create the environment:

```sh
# this program leverages the consortium-setup-utility node module
node setup.js PASTE_YOUR_APIKEY_HERE
```

Give this a minute or two.  It's doing all the resource creation calls and it takes a bit of time
for all the containers to spin up.  

When the program concludes, you'll see a long JSON blob in your terminal with all the resource
specific attributes.  You can overlook these for the time being, the subsequent programs are
orchestrated to read in the necessary values.

## Deploy and Invoke the Smart Contract

Open a second shell and kick off the `app.js` program:

```sh
# will listen on 3000
node app.js
```

This program, along with `SimpleStorage.js`, serves as our backend layer and allows us to send JSON RPC calls to the Ethereum network by means of the Web3.js APIs.   `app.js` is the router and `SimpleStorage.js` exposes the Ethereum-compatible APIs (i.e. it has our smart contract functions).  All of these pieces are important in their own right, however the SimpleStorage program is arguably the most relevant, as it's demonstrating how to send blockchain-specific calls.  

Great.  Now you have a running environment and callable application running locally on port 3000.  Let's go ahead and deploy the smart contract.  Back in your original shell, send a `POST` call to invoke the `deploy` function in `SimpleStorage.js`:

```sh
curl -X POST -H "Content-Type: application/json" localhost:3000/simplestorage/deploy | jq
```

This will deploy the contract and return you the smart contract's address. This response is piped into jq for better readibility, if you are not using jq then you can ignore the `| jq` on the end of the command.

Next, set a value for the contract's global variable - `storedData`.  Our example uses 5, but you can choose any positive integer.  We'll do this by sending another `POST` and invoking the `set` function in `SimpleStorage.js`.  The `set` function in the program maps to the `set` function in the smart contract.  Not too complicated!  

```sh
curl -X POST -H "Content-Type: application/json" localhost:3000/simplestorage/set -d '{"value":"5"}' | jq
```

Lastly, we can retrieve the value of our state variable by calling the contract's `get` function.  Once again, the `get` function in `SimpleStorage.js` maps to the `get` function in the smart contract:

```sh
curl -X GET -H "Content-Type: application/json" localhost:3000/simplestorage/get | jq
```

Congrats!  You've just instantiated and invoked a smart contract on a private Ethereum network.  Refer to the following section for additional Kaleido and Ethereum resources.  

## Resources
- [Kaleido Docs](http://console.kaleido.io/docs/docs/home/)
- [Remix](https://remix.ethereum.org) - solidity web IDE, compiler, and debugger.
   - [Remix Docs](https://remix.readthedocs.io/en/latest/)
- [Solidity Docs](https://solidity.readthedocs.io/en/v0.4.24/) - A language for smart contracts on Ethereum
- [Web3.js Docs](https://web3js.readthedocs.io/en/1.0/) - Ethereum compatible Javascript API for communicating with your blockchain network
- [Node.js Docs](https://nodejs.org/dist/latest-v8.x/docs/api/)
- [Javascript Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) - Promise objects can be tricky to new Javascript developers, but they're super powerful once you understand them
- Examples on Kaleido
    - [Racecourse](https://github.com/kaleido-io/racecourse)
    - [KaleidoKards](https://github.com/kaleido-io/KaleidoKards/)
    - [Kaleido-js](https://github.com/kaleido-io/kaleido-js)

## Help
- [Github Issues](https://github.com/kaleido-io/kaleido-hackathon/issues/new) for questions that may affect/help everyone
- Email <dylan.bryan@consensys.net> for specific questions and help   
