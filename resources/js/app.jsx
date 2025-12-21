import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import ErrorBoundary from "./components/shared/ErrorBoundary";

// Lazy Load Pages
const MenuPage = lazy(() => import("./pages/user/Menu"));
const CheckoutPage = lazy(() => import("./pages/user/Checkout"));
const SuccessPage = lazy(() => import("./pages/user/Success"));
const PendingPaymentPage = lazy(() => import("./pages/user/PendingPayment"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin Imports (Lazy)
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/auth/Login"));
import ProtectedRoute from "./components/shared/ProtectedRoute"; // Keep synchronous as it's a lightweight wrapper
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminPayment = lazy(() => import("./pages/admin/Payment"));
const AdminMenu = lazy(() => import("./pages/admin/Menu"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminModifiers = lazy(() => import("./pages/admin/Modifiers"));
const AdminTables = lazy(() => import("./pages/admin/Tables"));

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
    console.log("App component rendering...");
    return (
        <ErrorBoundary>
            <AuthProvider>
                <ToastProvider>
                    <CartProvider>
                        <BrowserRouter>
                            <Suspense fallback={<LoadingFallback />}>
                                <Routes>
                                    {/* Customer Routes */}
                                    <Route
                                        path="/"
                                        element={
                                            <Navigate to="/menu" replace />
                                        }
                                    />
                                    {/* Support both path param and query param for backward compatibility if needed, 
                                but prioritizing the path param as requested */}
                                    <Route
                                        path="/menu/:tableUuid"
                                        element={<MenuPage />}
                                    />
                                    <Route
                                        path="/menu"
                                        element={<MenuPage />}
                                    />
                                    <Route
                                        path="/checkout"
                                        element={<CheckoutPage />}
                                    />
                                    <Route
                                        path="/pending-payment"
                                        element={<PendingPaymentPage />}
                                    />
                                    <Route
                                        path="/success"
                                        element={<SuccessPage />}
                                    />

                                    {/* Admin Routes */}
                                    <Route
                                        path="/admin/login"
                                        element={<AdminLogin />}
                                    />

                                    <Route element={<ProtectedRoute />}>
                                        <Route
                                            path="/admin"
                                            element={<AdminLayout />}
                                        >
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
                                                path="payment"
                                                element={<AdminPayment />}
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

                                    {/* Catch-all Route */}
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </Suspense>
                        </BrowserRouter>
                    </CartProvider>
                </ToastProvider>
            </AuthProvider>
        </ErrorBoundary>
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
