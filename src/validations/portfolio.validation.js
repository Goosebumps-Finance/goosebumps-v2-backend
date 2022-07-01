const Joi = require("joi");

module.exports = {
  // POST /portfolio/gettrades
  GET_TRADES: {
    query: Joi.object({
      network: Joi.string().required(),
    }),
    body: Joi.array().required(),
  },
};
