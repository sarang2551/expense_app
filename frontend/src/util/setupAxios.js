import axios from 'axios';

const axiosClient = () => {
    const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost'; // Default base URL
    const port = process.env.REACT_APP_API_PORT || 5000; // Default port

    const instance = axios.create({
        baseURL: `${baseURL}:${port}`,
        withCredentials: true, // Send cookies with requests
    });

    return instance;
};

export default axiosClient;