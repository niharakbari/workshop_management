import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true, // Crucial for receiving and sending HttpOnly cookies (like refreshToken)
});

// Request interceptor to attach the access token if it exists
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle silent token refresh
axiosInstance.interceptors.response.use(
    (response) => {
        return response; // Success, just return the response
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't already retried this request
        // and the request was NOT the refresh endpoint itself
        if (
            error.response?.status === 401 && 
            !originalRequest._retry &&
            originalRequest.url !== "/auth/refresh"
        ) {
            originalRequest._retry = true; // Mark as retried to avoid infinite loops
            
            try {
                // Attempt to silently refresh the token using the HttpOnly cookie
                const refreshResponse = await axios.post(
                    "http://localhost:3000/auth/refresh", 
                    {}, 
                    { withCredentials: true } // Must include this to send the cookie
                );

                const newAccessToken = refreshResponse.data.accessToken;

                // Save the new access token
                if (newAccessToken) {
                    localStorage.setItem("accessToken", newAccessToken);
                    // Update the authorization header for the original request
                    originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                    
                    // Retry the original request
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails (e.g. refresh token expired), clean up state
                // The UI layer (AuthContext) will handle the redirect since the subsequent getMe/etc fails
                console.error('Silent refresh failed', refreshError);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
