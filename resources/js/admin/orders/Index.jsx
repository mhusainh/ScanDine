import React, { useState, useEffect } from "react";
import {
    Clock,
    CheckCircle,
    ChefHat,
    RotateCcw,
    History,
    List,
} from "lucide-react";
import axios from "axios";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("active"); // 'active' or 'history'
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        prev_page_url: null,
        next_page_url: null,
        total: 0,
    });

    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchOrders(1);

        // Only poll for active orders
        if (viewMode === "active") {
            const interval = setInterval(() => fetchOrders(1, true), 5000); // Poll every 5 seconds
            return () => clearInterval(interval);
        }
    }, [viewMode]);

    const fetchOrders = async (page = 1, isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const params = {
                page: page,
                status: viewMode === "active" ? "" : "history",
            };
            const response = await axios.get("/api/admin/orders", { params });
            setOrders(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                prev_page_url: response.data.prev_page_url,
                next_page_url: response.data.next_page_url,
                total: response.data.total,
            });
            setLoading(false);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        if (processingId) return; // Prevent multiple clicks
        setProcessingId(orderId);

        try {
            await axios.post(`/api/admin/orders/${orderId}/status`, {
                status: newStatus,
            });
            // Optimistic update
            if (
                viewMode === "active" &&
                (newStatus === "completed" || newStatus === "cancelled")
            ) {
                // Remove from active view
                setOrders(orders.filter((o) => o.id !== orderId));
            } else {
                setOrders(
                    orders.map((o) =>
                        o.id === orderId ? { ...o, status: newStatus } : o
                    )
                );
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
            case "confirmed":
                return "bg-amber-100 text-amber-800 border-amber-200";
            case "cooking":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "ready":
                return "bg-green-100 text-green-800 border-green-200";
            case "completed":
                return "bg-stone-100 text-stone-800 border-stone-200";
            case "cancelled":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-stone-100 text-stone-800 border-stone-200";
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-stone-800">
                        {viewMode === "active"
                            ? "Kitchen Display System (KDS)"
                            : "Order History"}
                    </h1>
                    <p className="text-stone-500">
                        {viewMode === "active"
                            ? "Manage active orders from the kitchen"
                            : "View past orders"}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setViewMode("active")}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                            viewMode === "active"
                                ? "bg-amber-600 text-white"
                                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
                        }`}
                    >
                        <ChefHat size={18} /> Active Orders
                    </button>
                    <button
                        onClick={() => setViewMode("history")}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                            viewMode === "history"
                                ? "bg-amber-600 text-white"
                                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
                        }`}
                    >
                        <History size={18} /> History
                    </button>
                    <button
                        onClick={() => fetchOrders(pagination.current_page)}
                        className="p-2 text-stone-500 hover:text-amber-600 rounded-lg border border-stone-200 hover:bg-stone-50"
                        title="Refresh"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
                    <p className="mt-2 text-stone-500">Loading orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-stone-300">
                    <div className="text-stone-400 mb-2">No orders found</div>
                    <p className="text-sm text-stone-500">
                        {viewMode === "active"
                            ? "New orders will appear here automatically"
                            : "No history available"}
                    </p>
                </div>
            ) : viewMode === "active" ? (
                // Active Orders Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden flex flex-col ${
                                getStatusColor(order.status).split(" ")[2]
                            }`}
                        >
                            <div
                                className={`p-4 flex justify-between items-center border-b ${getStatusColor(
                                    order.status
                                )}`}
                            >
                                <div className="flex items-center space-x-2">
                                    <span className="font-bold text-lg">
                                        Table {order.table?.table_number || "?"}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 bg-white/50 rounded-full font-mono">
                                        {new Date(
                                            order.created_at
                                        ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                                <span className="font-bold uppercase text-sm tracking-wider">
                                    {order.status}
                                </span>
                            </div>

                            <div className="p-4 flex-1 space-y-4">
                                {order.order_items?.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex justify-between items-start"
                                    >
                                        <div className="flex space-x-2">
                                            <span className="font-bold text-stone-800 w-6">
                                                {item.quantity}x
                                            </span>
                                            <div>
                                                <div className="text-stone-800 font-medium">
                                                    {item.menu_item?.name ||
                                                        "Unknown Item"}
                                                </div>
                                                {item.note && (
                                                    <div className="text-xs text-amber-600 italic mt-0.5">
                                                        Note: {item.note}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-stone-50 border-t border-stone-100 grid grid-cols-2 gap-2">
                                {(order.status === "pending" ||
                                    order.status === "confirmed") && (
                                    <button
                                        onClick={() =>
                                            updateStatus(order.id, "cooking")
                                        }
                                        disabled={processingId === order.id}
                                        className="col-span-2 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {processingId === order.id ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        ) : (
                                            <ChefHat size={18} />
                                        )}
                                        <span>
                                            {processingId === order.id
                                                ? "Processing..."
                                                : "Start Cooking"}
                                        </span>
                                    </button>
                                )}
                                {order.status === "cooking" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(order.id, "ready")
                                        }
                                        disabled={processingId === order.id}
                                        className="col-span-2 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {processingId === order.id ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        ) : (
                                            <CheckCircle size={18} />
                                        )}
                                        <span>
                                            {processingId === order.id
                                                ? "Processing..."
                                                : "Mark Ready"}
                                        </span>
                                    </button>
                                )}
                                {order.status === "ready" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(order.id, "completed")
                                        }
                                        disabled={processingId === order.id}
                                        className="col-span-2 bg-stone-800 text-white py-2 rounded-lg font-medium hover:bg-stone-900 flex items-center justify-center space-x-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {processingId === order.id ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        ) : (
                                            <CheckCircle size={18} />
                                        )}
                                        <span>
                                            {processingId === order.id
                                                ? "Processing..."
                                                : "Complete"}
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // History List View
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-stone-50 text-stone-500 text-sm">
                                <tr>
                                    <th className="px-6 py-4 text-left font-medium">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-4 text-left font-medium">
                                        Date & Time
                                    </th>
                                    <th className="px-6 py-4 text-left font-medium">
                                        Table
                                    </th>
                                    <th className="px-6 py-4 text-left font-medium">
                                        Items
                                    </th>
                                    <th className="px-6 py-4 text-left font-medium">
                                        Total
                                    </th>
                                    <th className="px-6 py-4 text-left font-medium">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-stone-50"
                                    >
                                        <td className="px-6 py-4 font-mono text-sm">
                                            #{order.id}
                                        </td>
                                        <td className="px-6 py-4 text-stone-600">
                                            {new Date(
                                                order.created_at
                                            ).toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            Table{" "}
                                            {order.table?.table_number || "?"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-stone-600 max-w-xs truncate">
                                            {order.order_items
                                                ?.map(
                                                    (i) =>
                                                        `${i.quantity}x ${i.menu_item?.name}`
                                                )
                                                .join(", ")}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            Rp{" "}
                                            {parseInt(
                                                order.total_amount
                                            ).toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                    order.status === "completed"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {pagination.total > 0 && (
                <div className="flex justify-between items-center pt-4 border-t border-stone-200">
                    <button
                        disabled={!pagination.prev_page_url}
                        onClick={() => fetchOrders(pagination.current_page - 1)}
                        className="px-4 py-2 border border-stone-300 rounded-lg disabled:opacity-50 hover:bg-stone-50"
                    >
                        Previous
                    </button>
                    <span className="text-stone-500">
                        Page {pagination.current_page} of {pagination.last_page}
                    </span>
                    <button
                        disabled={!pagination.next_page_url}
                        onClick={() => fetchOrders(pagination.current_page + 1)}
                        className="px-4 py-2 border border-stone-300 rounded-lg disabled:opacity-50 hover:bg-stone-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
