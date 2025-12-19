import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../lib/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyUser = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                // Configure axios to use the token
                axios.defaults.headers.common[
                    "Authorization"
                ] = `Bearer ${token}`;

                const response = await axios.get("/api/v1/me");
                if (response.data.success) {
                    setUser(response.data.data.user);
                } else {
                    handleLogout();
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                handleLogout();
            } finally {
                setIsLoading(false);
            }
        };

        verifyUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            // We use token-based auth, so we don't strictly need cookie-based CSRF for API calls
            // as long as we don't use the 'web' guard for API routes.
            // await axios.get("/sanctum/csrf-cookie");

            const response = await axios.post("/api/v1/login", {
                email,
                password,
            });

            if (response.data.success) {
                const { token, user } = response.data.data;
                localStorage.setItem("token", token);
                setToken(token);
                setUser(user);
                axios.defaults.headers.common[
                    "Authorization"
                ] = `Bearer ${token}`;
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Login failed",
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post("/api/v1/logout");
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            handleLogout();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common["Authorization"];
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
