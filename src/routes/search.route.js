const express = require("express");
const { validate } = require("express-validation");
const httpStatus = require("http-status");
const { isTokenOrNot } = require("../services/bitquery/queries/getpairs");
const { IS_TOKEN } = require("../validations/search.validation");

const router = express.Router();

router.get("/istoken", validate(IS_TOKEN), async (req, res) => {
  try {
    const is_token = await isTokenOrNot(req.query.network, req.query.address);
    res.json(is_token);
  } catch (error) {
    res.status(httpStatus.SERVICE_UNAVAILABLE);
    res.json(error.message);
  }
});

module.exports = router;
