const Joi = require("joi");

module.exports = {
  // GET /search/istoken
  IS_TOKEN: {
    query: Joi.object({
      address: Joi.string().required(),
      network: Joi.string().required(),
    }),
  },
};
