const { ethers } = require("ethers");
const { Contract, Provider } = require("ethers-multicall");
const _ = require("lodash");
const factoryAbi = require("../abi/factory.json");
const pairAbi = require("../abi/pair.json");
const tokenAbi = require("../abi/token.json");
const { networks } = require("../config/networks/index");

module.exports.getNetwork = (name) => {
  const result = _.find(networks, function (n) {
    return n.Name == name;
  });
  return result;
};

module.exports.getPairs = async (networkName, token) => {
  const network = this.getNetwork(networkName);

  const provider = new ethers.providers.JsonRpcProvider(network.RPC);
  const ethcallProvider = new Provider(provider);
  await ethcallProvider.init();

  let calls = [];

  const factoryContract = new Contract(network.DEX.Factory.Pancakeswap, factoryAbi);
  calls.push(factoryContract.getPair(token, network.Currency.Address));

  network.USDs.map((addr) => {
    calls.push(factoryContract.getPair(token, addr));
  });

  let responses = await ethcallProvider.all(calls);
  let pairs = _.filter(responses, function (o) {
    return o != ethers.constants.AddressZero;
  });

  pairs = pairs.map((pair) => {
    let p = {
      address: pair,
      exchange: {
        name: "PCS",
        fullName: "Pancakeswap",
      },
      smartContract: {
        address: {
          address: pair,
        },
      },
    };
    return p;
  });

  await ethcallProvider.init();

  calls = [];
  pairs.map((pair) => {
    const pairContract = new Contract(pair, pairAbi);
    calls.push(pairContract.token0());
    calls.push(pairContract.token1());
  });
  let callCounts = 1;

  let pairDetails = await ethcallProvider.all(calls);

  pairs.map((pair, index) => {});
  return pairs;
};

module.exports.isTokenOrAddress = async (networkName, address) => {
  const network = this.getNetwork(networkName);

  const provider = new ethers.providers.JsonRpcProvider(network.RPC);
  const ethcallProvider = new Provider(provider);
  await ethcallProvider.init();

  const tokenContract = new Contract(address, tokenAbi);

  try {
    calls.push(tokenContract.name());
    calls.push(tokenContract.symbol());
    calls.push(tokenContract.decimals());
    calls.push(tokenContract.totalSupply());

    await ethcallProvider.all(calls);
    return true;
  } catch (error) {
    return false;
  }

  // If the bytecode doesn't include the function selector functionA()
  // is definitely not present
  // wtf its fail when contract upgradable
  // if (
  //   !bytecode.includes(ethers.utils.id("name()").slice(2, 10)) &&
  //   !bytecode.includes(ethers.utils.id("symbol()").slice(2, 10)) &&
  //   !bytecode.includes(ethers.utils.id("decimals()").slice(2, 10)) &&
  //   !bytecode.includes(ethers.utils.id("totalSupply()").slice(2, 10))
  // ) {
  //   return false;
  // }

  // return true;
};
