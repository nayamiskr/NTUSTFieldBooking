const axios = require("axios");
require("dotenv").config();

const token = localStorage.getItem("token");
const client = axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: {
    Authorization: `Bearer ${token ? token.trim() : process.env.MY_TEMP_TOKEN.trim()}`,
  },
});

module.exports = { client };