import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import MenuPage from "./user/menu/Index";
import CheckoutPage from "./user/checkout/Index";
import SuccessPage from "./user/success/Index";

// Admin Imports
import AdminLayout from "./global_components/AdminLayout";
import AdminDashboard from "./admin/dashboard/Index";
import AdminOrders from "./admin/orders/Index";
import AdminMenu from "./admin/menu/Index";
import AdminCategories from "./admin/categories/Index";
import AdminModifiers from "./admin/modifiers/Index";
import AdminTables from "./admin/tables/Index";

const App = () => {
    return (
        <CartProvider>
            <BrowserRouter>
                <Routes>
                    {/* Customer Routes */}
                    <Route path="/" element={<Navigate to="/menu" replace />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/success" element={<SuccessPage />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route
                            index
                            element={<Navigate to="/admin/dashboard" replace />}
                        />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="menu" element={<AdminMenu />} />
                        <Route
                            path="categories"
                            element={<AdminCategories />}
                        />
                        <Route path="modifiers" element={<AdminModifiers />} />
                        <Route path="tables" element={<AdminTables />} />
                        {/* <Route path="settings" element={<AdminSettings />} /> */}
                    </Route>
                </Routes>
            </BrowserRouter>
        </CartProvider>
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
