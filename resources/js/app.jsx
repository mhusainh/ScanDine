import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

// Lazy Load Pages
const MenuPage = lazy(() => import("./user/menu/Index"));
const CheckoutPage = lazy(() => import("./user/checkout/Index"));
const SuccessPage = lazy(() => import("./user/success/Index"));

// Admin Imports (Lazy)
const AdminLayout = lazy(() => import("./global_components/AdminLayout"));
const AdminLogin = lazy(() => import("./admin/auth/Login"));
import ProtectedRoute from "./global_components/ProtectedRoute"; // Keep synchronous as it's a lightweight wrapper
const AdminDashboard = lazy(() => import("./admin/dashboard/Index"));
const AdminOrders = lazy(() => import("./admin/orders/Index"));
const AdminMenu = lazy(() => import("./admin/menu/Index"));
const AdminCategories = lazy(() => import("./admin/categories/Index"));
const AdminModifiers = lazy(() => import("./admin/modifiers/Index"));
const AdminTables = lazy(() => import("./admin/tables/Index"));

const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen bg-coffee-50">
        <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-coffee-200 border-t-coffee-800 rounded-full animate-spin"></div>
            <p className="text-coffee-800 font-medium animate-pulse">
                Loading ScanDine...
            </p>
        </div>
    </div>
);

const App = () => {
    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
                    <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                            {/* Customer Routes */}
                            <Route
                                path="/"
                                element={<Navigate to="/menu" replace />}
                            />
                            <Route path="/menu" element={<MenuPage />} />
                            <Route
                                path="/checkout"
                                element={<CheckoutPage />}
                            />
                            <Route path="/success" element={<SuccessPage />} />

                            {/* Admin Routes */}
                            <Route
                                path="/admin/login"
                                element={<AdminLogin />}
                            />

                            <Route element={<ProtectedRoute />}>
                                <Route path="/admin" element={<AdminLayout />}>
                                    <Route
                                        index
                                        element={
                                            <Navigate
                                                to="/admin/dashboard"
                                                replace
                                            />
                                        }
                                    />
                                    <Route
                                        path="dashboard"
                                        element={<AdminDashboard />}
                                    />
                                    <Route
                                        path="orders"
                                        element={<AdminOrders />}
                                    />
                                    <Route
                                        path="menu"
                                        element={<AdminMenu />}
                                    />
                                    <Route
                                        path="categories"
                                        element={<AdminCategories />}
                                    />
                                    <Route
                                        path="modifiers"
                                        element={<AdminModifiers />}
                                    />
                                    <Route
                                        path="tables"
                                        element={<AdminTables />}
                                    />
                                </Route>
                            </Route>
                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
};

if (document.getElementById("app")) {
    const root = ReactDOM.createRoot(document.getElementById("app"));
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
