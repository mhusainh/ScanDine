import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    TrendingUp,
    Users,
    ShoppingBag,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import axios from "../../libs/axios";

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-coffee-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} shadow-sm`}
            >
                <Icon size={24} className="text-white" />
            </div>
            {trend !== undefined && (
                <div
                    className={`flex items-center text-sm font-medium ${
                        trend >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                >
                    {trend >= 0 ? (
                        <ArrowUpRight size={16} />
                    ) : (
                        <ArrowDownRight size={16} />
                    )}
                    <span className="ml-1">{Math.abs(trend)}%</span>
                </div>
            )}
        </div>
        <h3 className="text-coffee-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-coffee-800 mt-1">{value}</p>
        {trend !== undefined && (
            <p className="text-xs text-coffee-400 mt-1">vs yesterday</p>
        )}
    </div>
);

const AdminDashboard = () => {
    const [data, setData] = useState({
        stats: {
            today_orders: 0,
            pending_orders: 0,
            today_revenue: 0,
            active_tables: 0,
            orders_trend: 0,
            revenue_trend: 0,
        },
        recentOrders: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get("/api/admin/dashboard");
            const result = response.data.data;

            // Transform backend structure to frontend state structure
            const transformedData = {
                stats: {
                    today_orders: result.today.orders,
                    pending_orders: result.pending_orders,
                    today_revenue: result.today.revenue,
                    active_tables: result.tables.occupied,
                    orders_trend: 0, // Not provided by backend yet
                    revenue_trend: 0, // Not provided by backend yet
                },
                recentOrders: result.recent_orders,
            };

            setData(transformedData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-coffee-900">
                        Dashboard
                    </h1>
                    <p className="text-coffee-500">
                        Overview of your restaurant performance
                    </p>
                </div>
                <div className="text-sm font-medium text-coffee-600 bg-white px-4 py-2 rounded-lg border border-coffee-100 shadow-sm">
                    {new Date().toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-coffee-100 animate-pulse h-[164px]"
                        >
                            <div className="flex justify-between mb-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                                <div className="w-16 h-6 bg-gray-200 rounded"></div>
                            </div>
                            <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="w-32 h-8 bg-gray-200 rounded"></div>
                        </div>
                    ))
                ) : (
                    <>
                        <StatCard
                            title="Total Revenue (Today)"
                            value={`Rp ${parseInt(
                                data.stats.today_revenue
                            ).toLocaleString("id-ID")}`}
                            icon={DollarSign}
                            color="bg-coffee-600"
                            trend={data.stats.revenue_trend}
                        />
                        <StatCard
                            title="Orders Today"
                            value={data.stats.today_orders}
                            icon={ShoppingBag}
                            color="bg-blue-600"
                            trend={data.stats.orders_trend}
                        />
                        <StatCard
                            title="Pending Orders"
                            value={data.stats.pending_orders}
                            icon={Users}
                            color="bg-purple-600"
                        />
                        <StatCard
                            title="Active Tables"
                            value={data.stats.active_tables}
                            icon={TrendingUp}
                            color="bg-green-600"
                        />
                    </>
                )}
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-coffee-100 overflow-hidden">
                <div className="p-6 border-b border-coffee-100 flex justify-between items-center">
                    <h2 className="font-bold text-lg text-coffee-800">
                        Recent Orders
                    </h2>
                    <Link
                        to="/admin/orders"
                        className="text-coffee-600 font-medium text-sm hover:underline"
                    >
                        View All
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-coffee-50/50 text-coffee-500 text-sm">
                            <tr>
                                <th className="px-6 py-4 text-left font-medium">
                                    Order ID
                                </th>
                                <th className="px-6 py-4 text-left font-medium">
                                    Table
                                </th>
                                <th className="px-6 py-4 text-left font-medium">
                                    Total
                                </th>
                                <th className="px-6 py-4 text-left font-medium">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left font-medium">
                                    Time
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-coffee-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : data.recentOrders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-4 text-center text-coffee-500"
                                    >
                                        No recent orders found.
                                    </td>
                                </tr>
                            ) : (
                                data.recentOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-coffee-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-mono text-sm text-coffee-600">
                                            #{order.id}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-coffee-800">
                                            Table{" "}
                                            {order.table?.table_number || "-"}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-coffee-800">
                                            Rp{" "}
                                            {parseInt(
                                                order.total_amount
                                            ).toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                                                    order.status === "pending"
                                                        ? "bg-orange-100 text-orange-700"
                                                        : order.status ===
                                                          "completed"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-blue-100 text-blue-700"
                                                }`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-coffee-500">
                                            {new Date(
                                                order.created_at
                                            ).toLocaleTimeString("id-ID", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
