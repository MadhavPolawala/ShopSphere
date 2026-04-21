import axios from 'axios';

const API = axios.create({
  baseURL: "/api",   // ✅ USE PROXY
  withCredentials: true,
});

export default API;