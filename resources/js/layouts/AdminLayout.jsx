import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    ShoppingBag,
    UtensilsCrossed,
    Settings,
    LogOut,
    Grid,
    Layers,
    QrCode,
    Menu,
    X,
    Wallet,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";

const AdminLayout = () => {
    const { logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        {
            path: "/admin/dashboard",
            icon: <LayoutDashboard size={20} />,
            label: "Dashboard",
        },
        {
            path: "/admin/payment",
            icon: <Wallet size={20} />,
            label: "Payment",
        },
        {
            path: "/admin/orders",
            icon: <ShoppingBag size={20} />,
            label: "Orders (KDS)",
        },
        {
            path: "/admin/menu",
            icon: <UtensilsCrossed size={20} />,
            label: "Menu",
        },
        {
            path: "/admin/categories",
            icon: <Grid size={20} />,
            label: "Categories",
        },
        {
            path: "/admin/modifiers",
            icon: <Layers size={20} />,
            label: "Modifiers",
        },
        { path: "/admin/tables", icon: <QrCode size={20} />, label: "Tables" },
    ];

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="flex min-h-screen bg-coffee-50">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-coffee-900/50 z-20 md:hidden backdrop-blur-sm"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    w-64 bg-coffee-900 text-white flex-shrink-0 fixed h-full z-30 flex flex-col border-r border-coffee-800
                    transition-transform duration-300 ease-in-out shadow-2xl
                    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                `}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-coffee-100 rounded-xl flex items-center justify-center text-coffee-900 font-bold shadow-lg transform rotate-3">
                                <span className="text-xl">☕</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-coffee-50 tracking-wide">
                                    ScanDine
                                </h1>
                                <p className="text-xs text-coffee-400 font-medium">
                                    ADMIN PANEL
                                </p>
                            </div>
                        </div>
                        {/* Close button for mobile */}
                        <button
                            onClick={closeMobileMenu}
                            className="md:hidden text-coffee-300 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={closeMobileMenu}
                                className={({ isActive }) => `
                                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                                    ${
                                        isActive
                                            ? "bg-coffee-800 text-white shadow-md border-l-4 border-coffee-400"
                                            : "text-coffee-300 hover:bg-coffee-800/50 hover:text-white"
                                    }
                                `}
                            >
                                {item.icon}
                                <span className="font-medium">
                                    {item.label}
                                </span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-coffee-800">
                    <button
                        onClick={logout}
                        className="flex items-center space-x-3 text-coffee-300 hover:text-red-400 transition-colors w-full px-4 py-2"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 transition-all duration-300 min-h-screen flex flex-col">
                {/* Topbar for mobile */}
                <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-coffee-100 p-4 md:hidden sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-coffee-900 rounded-lg flex items-center justify-center text-white font-bold">
                                S
                            </div>
                            <span className="font-bold text-coffee-900">
                                ScanDine
                            </span>
                        </div>
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 text-coffee-600 hover:bg-coffee-50 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </header>

                <div className="p-4 md:p-8 flex-1 overflow-x-hidden">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
