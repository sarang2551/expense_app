import axios from 'axios';

const axiosClient = () => {
    const baseURL = process.env.BACKEND_URL || 'http://localhost';
    const port = process.env.REACT_APP_API_PORT || 5000;

    const instance = axios.create({
        baseURL: baseURL,
        withCredentials: true, // Send cookies with requests
        headers: {
          'Content-Type': 'application/json', // Set default content type
        }
    });
    // add a authorization headers if jwt_token is present
    instance.interceptors.request.use(
        config => {
            const token = localStorage.getItem('jwt_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        error => {
            return Promise.reject(error);
        }
    );

    return instance;
};


export default axiosClient;