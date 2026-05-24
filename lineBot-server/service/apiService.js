import axios from "axios";
import "dotenv/config";

export const client = axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.MY_TEMP_TOKEN.trim()}`,
  },
});
