import axios from "axios";

axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.withCredentials = true;

const tokenEl = document.head.querySelector('meta[name="csrf-token"]');
if (tokenEl) {
    axios.defaults.headers.common["X-CSRF-TOKEN"] = tokenEl.content;
}

// Add a request interceptor to inject the token
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Only redirect if not already on login page to avoid loops
            if (
                !window.location.pathname.includes("/admin/login") &&
                window.location.pathname.startsWith("/admin")
            ) {
                localStorage.removeItem("token");
                window.location.href = "/admin/login";
            }
        }
        return Promise.reject(error);
    }
);

export default axios;
