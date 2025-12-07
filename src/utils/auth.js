import axios from 'axios';

const TOKEN_KEY = 'nms_token';
const USER_KEY = 'nms_user';

export const setSession = (token, user) => {
    // Fixed: Removed the erroneous "BS_KEY" line causing the crash
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '/login';
};

export const getSession = () => {
    try {
        const userStr = localStorage.getItem(USER_KEY);
        return {
            token: localStorage.getItem(TOKEN_KEY),
            user: userStr ? JSON.parse(userStr) : null,
        };
    } catch (e) {
        return { token: null, user: null };
    }
};

export const setupAxios = () => {
    axios.interceptors.request.use(config => {
        const { token } = getSession();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    axios.interceptors.response.use(
        response => response,
        error => {
            if (error.response && error.response.status === 401) {
                clearSession();
            }
            return Promise.reject(error);
        }
    );
};
