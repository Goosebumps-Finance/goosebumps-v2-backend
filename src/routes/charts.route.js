/* eslint-disable node/no-unpublished-require */
const express = require("express");
const router = express.Router();
const { validate } = require("express-validation");
const httpStatus = require("http-status");

const { getPairsData } = require("../services/bitquery/queries/getpairs");
const { getOHLC, getLatestTrades } = require("../services/bitquery/queries/getTrades");
const { getCmcInfo } = require("../services/coinmarketcap");
const { GET_PAIRS, GET_CMC_INFO, GET_LATEST_TRADE, GET_OHLC } = require("../validations/charts.validation");

/**
 * GET charts/getpairs
 */
router.get("/getpairs", validate(GET_PAIRS), async (req, res) => {
  const reqAddress = req.query.address;
  const reqNetwork = req.query.network;
  try {
    const result = await getPairsData(reqNetwork, reqAddress);
    res.json(result);
  } catch (error) {
    res.status(httpStatus.SERVICE_UNAVAILABLE);
    res.json(error.message);
  }
});

/**
 * GET charts/getcmcinfo
 */
router.get("/getcmcinfo", validate(GET_CMC_INFO), async (req, res) => {
  let q = req.query;
  try {
    const result = await getCmcInfo(q.address);
    res.json(result);
  } catch (error) {
    res.status(httpStatus.SERVICE_UNAVAILABLE);
    res.json(error.message);
  }
});

/**
 * GET charts/getlatesttrades
 */
router.get("/getlatesttrades", validate(GET_LATEST_TRADE), async (req, res) => {
  let q = req.query;

  if (q.limit === undefined) {
    q.limit = 20;
  }
  try {
    const result = await getLatestTrades(q);
    res.json(result);
  } catch (error) {
    res.status(httpStatus.SERVICE_UNAVAILABLE);
    res.json(error.message);
  }
});

/**
 * GET charts/getohlc
 */
router.get("/getohlc", validate(GET_OHLC), async (req, res) => {
  let q = req.query;

  if (q.interval === "1D") {
    q.interval = 1440;
  }
  try {
    const result = await getOHLC(q);

    res.json(result);
  } catch (error) {
    res.status(httpStatus.SERVICE_UNAVAILABLE);
    res.json(error.message);
  }
});

module.exports = router;
