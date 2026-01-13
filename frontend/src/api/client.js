import axios from "axios";
import { mockListings, mockAnalytics } from "../utils/mockData";

// const api = axios.create({
//     baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// })

const api = {
  get: (url) => {
    if (url.includes("analytics")) {
      return { data: mockAnalytics };
    }
    if (url.includes("listings")) {
      return { data: mockListings };
    }
  },
};

export default api;
