const axios = require("axios");
const dotenv = require("dotenv");
const CMC_ENDPOINT = "https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?address=";
const CMC_PRO_API_KEY = process.env.CMC_PRO_API_KEY;

const getCmcInfo = async (addr) => {
  const api_url = `${CMC_ENDPOINT}${addr}`;
  let response = null;
  try {
    response = await axios.get(api_url, {
      headers: {
        "X-CMC_PRO_API_KEY": CMC_PRO_API_KEY,
      },
    });
  } catch (ex) {
    response = null;
    // error
    console.log(ex);
    return ex;
  }
  if (response) {
    // success
    const json = response.data.data;
    let [key, value] = Object.entries(json)[0];
    console.log(value);
    return value;
  }
};

module.exports = { getCmcInfo };
