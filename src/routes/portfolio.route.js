const express = require("express");
const { getBuyTrades, getSellTrades } = require("../services/bitquery/queries/getTrades");
const router = express.Router();
const { validate } = require("express-validation");
const httpStatus = require("http-status");
const _ = require("lodash");
const { GET_TRADES } = require("../validations/portfolio.validation");

/**
 * GET portfolio/gettrades
 */
router.post("/gettrades", validate(GET_TRADES), async (req, res) => {
  const reqAddress = req.body[0];
  const reqNetwork = req.query.network;
  try {
    const [buyTrades, sellTrades] = await Promise.all([
      getBuyTrades(reqNetwork, reqAddress),
      getSellTrades(reqNetwork, reqAddress),
    ]);

    buyTrades.ethereum.buy.map((x) => {
      x.transactionType = 1;
      return x;
    });

    sellTrades.ethereum.sell.map((x) => {
      x.transactionType = 2;
      return x;
    });

    let data = _.concat(sellTrades.ethereum.sell, buyTrades.ethereum.buy);
    data = _.orderBy(
      data,
      [
        function (o) {
          return o.block.timestamp.iso8601;
        },
      ],
      ["asc"],
    );

    let pair = _.map(data, (x) => {
      let d = {
        smartContract: x.smartContract,
        buyCurrency: x.buyCurrency,
        sellCurrency: x.sellCurrency,
      };
      return d;
    });
    pair = _.uniqBy(pair, (o) => o.buyCurrency.address);

    let result = _.map(pair, (x) => {
      let r = {};
      r.pair = x;
      let trades = _.filter(data, (o) => o.buyCurrency.address == x.buyCurrency.address).map((x) => {
        x.priceUSD = x.totalUSD / x.tokenAmount;
        x.dateTime = x.block.timestamp.iso8601;
        return x;
      });

      let filteredTrades = _.map(trades, (e) => {
        let d = {};
        d.amount = e.tokenAmount;
        if (e.transactionType == 2) {
          d.amount = 0;
        }
        d.priceUSD = e.priceUSD;
        d.dateTime = e.dateTime;
        d.transactionType = e.transactionType;
        return d;
      });
      r.trades = _.map(trades, (x, index) => {
        let y = {};
        y.dateTime = x.block.timestamp.iso8601;
        y.tx = x.transaction.hash;
        y.priceUSD = x.priceUSD;
        y.tokenAmount = x.tokenAmount;
        y.holdingAmount = 0;
        y.transactionType = x.transactionType;
        y.buyPrices = [];
        let sellAmount = 0;
        if (x.transactionType == 2) {
          sellAmount = x.tokenAmount;
          const buyPrices = _.cloneDeep(filteredTrades).filter((ft) => ft.dateTime < y.dateTime && ft.amount > 0);
          y.buyPrices = buyPrices;
          for (let i = 0; i < index; i++) {
            if (sellAmount > 0) {
              if (filteredTrades[i].amount >= sellAmount) {
                filteredTrades[i].amount = filteredTrades[i].amount - sellAmount;
                sellAmount = 0;
              } else {
                sellAmount = sellAmount - filteredTrades[i].amount;
                filteredTrades[i].amount = 0;
              }
            }
          }
        }
        return y;
      });
      r.volume = _.reduce(
        trades,
        (y, x) => {
          if (x.transactionType == 1) {
            return y + x.totalUSD;
          }
          return y;
        },
        0,
      );
      r.ins = _.reduce(
        trades,
        (y, x) => {
          if (x.transactionType == 1) {
            return y + x.tokenAmount;
          }
          return y;
        },
        0,
      );
      r.outs = _.reduce(
        trades,
        (y, x) => {
          if (x.transactionType == 2) {
            return y + x.tokenAmount;
          }
          return y;
        },
        0,
      );

      return r;
    });

    res.json(result);
  } catch (error) {
    res.status(httpStatus.SERVICE_UNAVAILABLE);
    res.json(error.message);
  }
});

module.exports = router;
