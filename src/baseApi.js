import axios from "axios";

const instance = axios.create({
  baseURL: 'https://api-field.gravitycat.tw/v1',
  timeout: 1000,
  headers: {'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }

});

export default instance;