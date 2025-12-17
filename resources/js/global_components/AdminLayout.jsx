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
} from "lucide-react";

const AdminLayout = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        {
            path: "/admin/dashboard",
            icon: <LayoutDashboard size={20} />,
            label: "Dashboard",
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
        {
            path: "/admin/settings",
            icon: <Settings size={20} />,
            label: "Settings",
        },
    ];

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="flex min-h-screen bg-stone-50">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    w-64 bg-stone-900 text-white flex-shrink-0 fixed h-full z-30 flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                `}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3 text-amber-500">
                            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white font-bold">
                                S
                            </div>
                            <h1 className="text-xl font-bold text-white">
                                ScanDine
                            </h1>
                        </div>
                        {/* Close button for mobile */}
                        <button
                            onClick={closeMobileMenu}
                            className="md:hidden text-stone-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="space-y-2">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={closeMobileMenu}
                                className={({ isActive }) => `
                                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors
                                    ${
                                        isActive
                                            ? "bg-amber-800 text-white font-medium"
                                            : "text-stone-400 hover:bg-stone-800 hover:text-white"
                                    }
                                `}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-stone-800">
                    <button className="flex items-center space-x-3 text-stone-400 hover:text-white transition-colors w-full">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header (Visible on small screens) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-stone-900 text-white z-20 flex items-center justify-between px-4 shadow-md">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white font-bold">
                        S
                    </div>
                    <span className="font-bold">ScanDine Admin</span>
                </div>
                <button
                    onClick={toggleMobileMenu}
                    className="text-white p-2 hover:bg-stone-800 rounded-lg"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-6 pt-20 md:pt-6 w-full">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
