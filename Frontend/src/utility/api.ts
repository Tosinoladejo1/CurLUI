
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:80", 
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;

