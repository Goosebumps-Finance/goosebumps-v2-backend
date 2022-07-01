const Joi = require("joi");

module.exports = {
  // GET /search/istoken
  GET_PAIRS: {
    query: Joi.object({
      address: Joi.string().required(),
      network: Joi.string().required(),
    }),
  },
  GET_CMC_INFO: {
    query: Joi.object({
      address: Joi.string().required(),
      network: Joi.string().required(),
    }),
  },
  GET_LATEST_TRADE: {
    query: Joi.object({
      token0: Joi.string().required(),
      token1: Joi.string().required(),
      pair: Joi.string().required(),
      network: Joi.string().required(),
      startTime: Joi.number().required(),
      endTime: Joi.number().required(),
      limit: Joi.number(),
    }),
  },
  GET_OHLC: {
    query: Joi.object({
      token0: Joi.string().required(),
      token1: Joi.string().required(),
      pair: Joi.string().required(),
      exchange: Joi.string().required(),
      network: Joi.string().required(),
      startTime: Joi.number().required(),
      endTime: Joi.number().required(),
      useCache: Joi.bool(),
      interval: Joi.any(),
      countBack: Joi.number(),
    })
      .with("token0", "token1")
      .with("startTime", "endTime")
      .with("useCache", "interval")
      .with("exchange", "network"),
  },
};
