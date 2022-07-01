const express = require("express");

const chartsRoutes = require("./charts.route");
const searchRoutes = require("./search.route");
const portfolioRoutes = require("./portfolio.route");

const router = express.Router();

router.get("/", (req, res) => res.send("OK"));
/**
 * GET v1/status
 */
router.get("/status", (req, res) => res.send("OK"));

router.use("/charts", chartsRoutes);
router.use("/search", searchRoutes);
router.use("/portfolio", portfolioRoutes);

module.exports = router;
