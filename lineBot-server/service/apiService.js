const axios = require("axios");
require("dotenv").config();

const client = axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.MY_TEMP_TOKEN.trim()}`,
  },
});

module.exports = { client };