const { request } = require("graphql-request");
const { getNetwork } = require("../../onChainProviders");

const BITQUERY_ENDPOINT = "https://graphql.bitquery.io";
const BITQUERY_API = "BQYs1yL4DniyLSvloH4zxulMTH6A0e3i";
// const BITQUERY_API = "BQYuLyenH5JOov1Fi6NrzGnPnoEYS35j";

const inOutQueries = async (network, address) => {
  let gql = `query (
  $network: EthereumNetwork!
  $address: String!
  ){
    ethereum(network: $network) {
      out: transfers(
        options: {asc: "out"}
        any: [{sender: {is: $address}}, {receiver: {is: $address}}]
      ) {
        in: amount(receiver: {is: $address})
        out: amount(sender: {is: $address})
        currency {
          symbol
          address
        }
      }
    }
  }`;
  let variables = {
    network: network,
    address: address,
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
  return result;
};

const latestTrade = async (network, address) => {
  let gql = `query (
  $network: EthereumNetwork!
  $address: String!
  ){
    ethereum(network: $network) {
      out: transfers(
        options: {asc: "out"}
        any: [{sender: {is: $address}}, {receiver: {is: $address}}]
      ) {
        in: amount(receiver: {is: $address})
        out: amount(sender: {is: $address})
        currency {
          symbol
          address
        }
      }
    }
  }`;
  let variables = {
    network: network,
    address: address,
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
  return result;
};

const getBuyTrades = async (networkName, address) => {
  const network = getNetwork(networkName);
  let gql = `query ($network: EthereumNetwork!, $address: String!, $nativeCurrency: String) {
  ethereum(network: $network) {
    buy: dexTrades(
      txSender: {is: $address}
      buyCurrency: {is: $nativeCurrency}
      options: {asc: "buyCurrency.symbol"}
    ) {
      smartContract {
        address {
          address
        }
      }
      buyCurrency: sellCurrency {
        address
        name
        symbol
      }
      sellCurrency: buyCurrency {
        address
        name
        symbol
      }
      bnbAmount: buyAmount
      totalUSD: buyAmount(in: USD)
      tokenAmount: sellAmount
      block {
        timestamp {
          iso8601
        }
      }
      transaction {
        hash
      }
    }
  }
}
`;
  let variables = {
    network: network.Name,
    nativeCurrency: network.Currency.Address,
    address: address,
  };
  let headers = {
    "Content-Type": "application/json",
    accept: "application/json",
    "x-api-key": BITQUERY_API,
  };

  try {
    const result = await request({
      url: BITQUERY_ENDPOINT,
      document: gql,
      variables: variables,
      requestHeaders: headers,
    });
    return {
      status: 200,
      result
    };
  } catch(err) {
    console.log("getBuyTrades err response=",err.response);
    if(err.response.errors.length!==0) 
      return { status: 201, error: err.response.errors[0]}
    return { status: err.response.status, error: err.response.error}
  }
  
};

const getSellTrades = async (networkName, address) => {
  const network = getNetwork(networkName);
  let gql = `query ($network: EthereumNetwork!, $address: String!, $nativeCurrency: String) {
  ethereum(network: $network) {
    sell: dexTrades(txSender: {is: $address}, sellCurrency: {is: $nativeCurrency}) {
      smartContract{
        address {
          address
        }
      }
      sellCurrency {
        address
        name
        symbol
      }
      buyCurrency {
        address
        name
        symbol
      }
      tokenAmount: buyAmount
      bnbAmount: sellAmount
      totalUSD: sellAmount(in: USD)
      transaction {
        hash
      }
      block {
        timestamp {
          iso8601
        }
      }
      
    }
  }
}
`;
  let variables = {
    network: network.Name,
    nativeCurrency: network.Currency.Address,
    address: address,
  };
  let headers = {
    "Content-Type": "application/json",
    accept: "application/json",
    "x-api-key": BITQUERY_API,
  };

  try {
    const result = await request({
      url: BITQUERY_ENDPOINT,
      document: gql,
      variables: variables,
      requestHeaders: headers,
    });
    return {
      status: 200,
      result
    };
  } catch(err) {
    console.log("getSellTrades error=", err.response)
    if(err.response.errors.length!==0) 
      return { status: 201, error: err.response.errors[0]}
    return { status: err.response.status, error: err.response.error}
  }
  
};

const getOHLC = async (args) => {
  const network = getNetwork(args.network);
  let gql = `query (
  $network: EthereumNetwork!, 
  $pair: String!,
  $token1: String!,
  $interval: Int!,
  $from: ISO8601DateTime,
  $till: ISO8601DateTime) {
  ethereum(network: $network) {
    dexTrades(
      date: {since: $from, till: $till}
      options: {asc: "timeInterval.minute"}
      smartContractAddress: {is: $pair}
      quoteCurrency: {is: $token1}
    ) {
      timeInterval {
        minute(count: $interval, format: "%Y-%m-%dT%H:%M:%SZ")
      }
      high: quotePrice(calculate: maximum)
      low: quotePrice(calculate: minimum)
      open: minimum(of: block, get: quote_price)
      close: maximum(of: block, get: quote_price)
      baseCurrency {
        name
      }
      quoteCurrency {
        name
      }
      trades: count
      volume: quoteAmount
      volumeUSD: quoteAmount (in:USD)
    }
  }
}
`;

  let variables = {
    network: network.Name,
    from: new Date(Number(args.startTime) * 1000).toISOString(),
    till: new Date(Number(args.endTime) * 1000).toISOString(),
    token0: args.token0,
    token1: args.token1,
    pair: args.pair,
    interval: Number(args.interval),
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

  let result = response.ethereum.dexTrades
    .map((el) => ({
      time: new Date(el.timeInterval.minute).getTime(), // date string in api response
      low: (Math.abs(el.low) * el.volumeUSD) / el.volume,
      high: (Math.abs(el.high) * el.volumeUSD) / el.volume,
      open: (Math.abs(Number(el.open)) * el.volumeUSD) / el.volume,
      close: (Math.abs(Number(el.close)) * el.volumeUSD) / el.volume,
      volume: Math.abs(el.volumeUSD),
      lowBNB: Math.abs(el.low),
      highBNB: Math.abs(el.high),
      openBNB: Math.abs(Number(el.open)),
      closeBNB: Math.abs(Number(el.close)),
      volumeBNB: Math.abs(el.volume),
    }))
    .filter((x) => {
      return x.time >= args.startTime * 1000 && x.time <= args.endTime * 1000;
    });

  return result;
};

const getLatestTrades = async (args) => {
  const network = getNetwork(args.network);
  let baseCurrency = args.token1;

  let gql = `
query (
    $network: EthereumNetwork!, 
    $limit: Int!, 
    $from: ISO8601DateTime, 
    $till: ISO8601DateTime,
    $pair: String!,
    $baseCurrency: String!,
    ) {
  ethereum(network: $network) {
    dexTrades(
      options: {desc: "block.timestamp.unixtime", asc: "tradeIndex", limit: $limit}
      date: {since: $from, till: $till}
      smartContractAddress: {is: $pair}
      baseCurrency: {is: $baseCurrency}
    ) {
      baseCurrency {
        symbol
        address
        decimals
      }
      value: baseAmount
      valueUSD: baseAmount(in: USD)
      quoteCurrency {
        symbol
        address
        decimals
      }
      tokens: quoteAmount
      side
      transaction {
        hash
      }
      exchange {
        fullName
      }
      tradeIndex
      block {
        timestamp {
          unixtime
        }
      }
    }
  }
}


`;

  let variables = {
    network: network.Name,
    from: new Date(Number(args.startTime) * 1000).toISOString(),
    till: new Date(Number(args.endTime) * 1000).toISOString(),
    pair: args.pair,
    baseCurrency: baseCurrency,
    limit: Number(args.limit),
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

  const result = response.ethereum.dexTrades.map((el) => ({
    isBuy: el.side == "SELL" ? false : true,
    dex: el.exchange.fullName,
    time: el.block.timestamp.unixtime * 1000,
    tx: el.transaction.hash,
    symbol: el.baseCurrency.symbol,
    tokens: el.tokens,
    value: el.value,
    valueUSD: el.valueUSD,
    rawPrice: el.rawPrice,
    price: el.value / el.tokens,
    priceUSD: el.valueUSD / el.tokens,
  }));
  // result.shift();

  return result;
};

module.exports = {
  inOutQueries,
  latestTrade,
  getSellTrades,
  getBuyTrades,
  getOHLC,
  getLatestTrades,
};
