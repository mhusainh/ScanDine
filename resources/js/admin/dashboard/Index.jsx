import React, { useState, useEffect } from "react";
import { TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react";
import axios from "axios";

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="flex items-center justify-between mb-4">
            <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
            >
                <Icon size={24} className="text-white" />
            </div>
            {/* Trend functionality can be added later */}
        </div>
        <h3 className="text-stone-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-stone-800 mt-1">{value}</p>
    </div>
);

const AdminDashboard = () => {
    const [data, setData] = useState({
        stats: {
            today_orders: 0,
            pending_orders: 0,
            today_revenue: 0,
            active_tables: 0,
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
            setData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-stone-800">
                        Dashboard
                    </h1>
                    <p className="text-stone-500">
                        Overview of your restaurant performance
                    </p>
                </div>
                <div className="text-sm text-stone-500">
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
                <StatCard
                    title="Total Revenue (Today)"
                    value={`Rp ${parseInt(
                        data.stats.today_revenue
                    ).toLocaleString("id-ID")}`}
                    icon={DollarSign}
                    color="bg-amber-600"
                />
                <StatCard
                    title="Orders Today"
                    value={data.stats.today_orders}
                    icon={ShoppingBag}
                    color="bg-blue-600"
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
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h2 className="font-bold text-lg text-stone-800">
                        Recent Orders
                    </h2>
                    <button className="text-amber-600 font-medium text-sm hover:underline">
                        View All
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-stone-50 text-stone-500 text-sm">
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
                        <tbody className="divide-y divide-stone-100">
                            {data.recentOrders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-4 text-center text-stone-500"
                                    >
                                        No recent orders found.
                                    </td>
                                </tr>
                            ) : (
                                data.recentOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-stone-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-mono text-sm text-stone-600">
                                            #{order.id}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-stone-800">
                                            Table{" "}
                                            {order.table?.table_number || "-"}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
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
                                        <td className="px-6 py-4 text-sm text-stone-500">
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
