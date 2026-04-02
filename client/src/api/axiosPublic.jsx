import axios from 'axios';

// This automatically detects if the app is in 'production' (live) or 'development' (localhost)
const baseURL = import.meta.env.MODE === 'production' 
    ? 'https://fast-food-backend-v1.onrender.com/api' 
    : 'http://localhost:5000/api';

const axiosPublic = axios.create({
    baseURL: baseURL
});

export default axiosPublic;