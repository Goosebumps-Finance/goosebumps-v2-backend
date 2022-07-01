const { request } = require("graphql-request");
const { getNetwork } = require("../../onChainProviders");

const BITQUERY_ENDPOINT = "https://graphql.bitquery.io";
const BITQUERY_API = "BQYs1yL4DniyLSvloH4zxulMTH6A0e3i";

const getPairsData = async (networkName, address) => {
  const network = getNetwork(networkName);
  let gql = `query ($network: EthereumNetwork!, $token: String) {
  ethereum(network: $network) {
    dexTrades(options:{desc:"trades", limit:10} baseCurrency: {is: $token}) {
      smartContract {
        address {
          address
          annotation
        }
      }
      sellCurrency:quoteCurrency {
        address
        name
        symbol
      }
      buyCurrency:baseCurrency {
        address
        name
        symbol
      }
      exchange {
        address {
          address
          annotation
        }
        fullName
      }
      trades:count(uniq: txs)
    }
  }
}

`;
  let variables = {
    network: network.Name,
    token: address,
  };
  let headers = {
    "Content-Type": "application/json",
    accept: "application/json",
    "x-api-key": BITQUERY_API,
  };

  const result = await request({
    url: BITQUERY_ENDPOINT,
    document: gql,
    variables: variables,
    requestHeaders: headers,
  });

  return result.ethereum.dexTrades;
};

const isTokenOrNot = async (networkName, address) => {
  const network = getNetwork(networkName);
  let gql = `query ($network: EthereumNetwork!, $address: String!) {
  ethereum(network: $network) {
    address(address: {is: $address}) {
      smartContract {
        contractType
      }
    }
  }
}

`;
  let variables = {
    network: network.Name,
    address: address,
  };
  let headers = {
    "Content-Type": "application/json",
    accept: "application/json",
    "x-api-key": BITQUERY_API,
  };

  const response = await request({
    url: BITQUERY_ENDPOINT,
    document: gql,
    variables: variables,
    requestHeaders: headers,
  });

  return response.ethereum.address[0].smartContract == null ? false : true;
};

module.exports = {
  getPairsData,
  isTokenOrNot,
};
