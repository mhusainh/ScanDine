import React, { useState, useEffect } from "react";
import {
    Clock,
    CheckCircle,
    ChefHat,
    RotateCcw,
    History,
    List,
} from "lucide-react";
import axios from "../../libs/axios";
import { useToast } from "../../contexts/ToastContext";

const AdminOrders = () => {
    const { error: toastError, success } = useToast();
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
                status: viewMode === "active" ? "active" : "history",
            };
            const response = await axios.get("/api/admin/orders", { params });
            const result = response.data.data;
            setOrders(result.data);
            setPagination({
                current_page: result.current_page,
                last_page: result.last_page,
                prev_page_url: result.prev_page_url,
                next_page_url: result.next_page_url,
                total: result.total,
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
            await axios.patch(`/api/admin/orders/${orderId}/status`, {
                status: newStatus,
            });
            // Optimistic update
            if (
                viewMode === "active" &&
                (newStatus === "served" ||
                    newStatus === "completed" ||
                    newStatus === "cancelled")
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
            toastError("Failed to update status");
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-gray-100 text-gray-600 border-gray-200";
            case "confirmed":
                return "bg-coffee-100 text-coffee-800 border-coffee-200";
            case "preparing":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "served":
                return "bg-green-100 text-green-800 border-green-200";
            case "completed":
                return "bg-gray-100 text-gray-600 border-gray-200";
            case "cancelled":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-coffee-100 text-coffee-800 border-coffee-200";
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-coffee-800">
                        {viewMode === "active"
                            ? "Kitchen Display System (KDS)"
                            : "Order History"}
                    </h1>
                    <p className="text-coffee-500">
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
                                ? "bg-coffee-600 text-white"
                                : "bg-white text-coffee-600 border border-coffee-200 hover:bg-coffee-50"
                        }`}
                    >
                        <ChefHat size={18} /> Active Orders
                    </button>
                    <button
                        onClick={() => setViewMode("history")}
                        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                            viewMode === "history"
                                ? "bg-coffee-600 text-white"
                                : "bg-white text-coffee-600 border border-coffee-200 hover:bg-coffee-50"
                        }`}
                    >
                        <History size={18} /> History
                    </button>
                    <button
                        onClick={() => fetchOrders(pagination.current_page)}
                        className="p-2 text-coffee-500 hover:text-coffee-600 rounded-lg border border-coffee-200 hover:bg-coffee-50"
                        title="Refresh"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden flex flex-col animate-pulse"
                        >
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex gap-2 items-center">
                                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                                    <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                                </div>
                                <div className="h-5 bg-gray-200 rounded w-24"></div>
                            </div>
                            <div className="p-4 flex-1 space-y-4 min-h-[160px]">
                                {[...Array(3)].map((_, j) => (
                                    <div key={j} className="flex gap-2">
                                        <div className="h-5 bg-gray-200 rounded w-6"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                            {j === 0 && (
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-gray-100 bg-gray-50">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="h-10 bg-gray-200 rounded col-span-2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-coffee-300">
                    <div className="text-coffee-400 mb-2">No orders found</div>
                    <p className="text-sm text-coffee-500">
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
                                            <span className="font-bold text-coffee-800 w-6">
                                                {item.quantity}x
                                            </span>
                                            <div>
                                                <div className="text-coffee-800 font-medium">
                                                    {item.menu_item?.name ||
                                                        "Unknown Item"}
                                                </div>
                                                {item.order_item_modifiers &&
                                                    item.order_item_modifiers
                                                        .length > 0 && (
                                                        <div className="text-xs text-coffee-600 mt-1 space-y-0.5">
                                                            {item.order_item_modifiers.map(
                                                                (mod, mIdx) => (
                                                                    <div
                                                                        key={
                                                                            mIdx
                                                                        }
                                                                        className="flex items-center"
                                                                    >
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-coffee-400 mr-2"></span>
                                                                        {
                                                                            mod
                                                                                .modifier_item
                                                                                ?.name
                                                                        }
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                {item.note && (
                                                    <div className="text-xs text-coffee-600 italic mt-1 bg-yellow-50 px-2 py-1 rounded border border-yellow-100 inline-block">
                                                        Note: {item.note}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-coffee-50 border-t border-coffee-100 grid grid-cols-2 gap-2">
                                {order.status === "confirmed" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(order.id, "preparing")
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
                                {order.status === "preparing" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(order.id, "served")
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
                                                : "Serve Order"}
                                        </span>
                                    </button>
                                )}
                                {order.status === "ready" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(order.id, "completed")
                                        }
                                        disabled={processingId === order.id}
                                        className="col-span-2 bg-coffee-800 text-white py-2 rounded-lg font-medium hover:bg-coffee-900 flex items-center justify-center space-x-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
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
                <div className="bg-white rounded-2xl shadow-sm border border-coffee-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-coffee-50/50 text-coffee-500 text-sm">
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
                            <tbody className="divide-y divide-coffee-100">
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-coffee-50/50"
                                    >
                                        <td className="px-6 py-4 font-mono text-sm">
                                            #{order.id}
                                        </td>
                                        <td className="px-6 py-4 text-coffee-600">
                                            {new Date(
                                                order.created_at
                                            ).toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            Table{" "}
                                            {order.table?.table_number || "?"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-coffee-600 max-w-xs truncate">
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
                <div className="flex justify-between items-center pt-4 border-t border-coffee-200">
                    <button
                        disabled={!pagination.prev_page_url}
                        onClick={() => fetchOrders(pagination.current_page - 1)}
                        className="px-4 py-2 border border-coffee-300 rounded-lg disabled:opacity-50 hover:bg-coffee-50"
                    >
                        Previous
                    </button>
                    <span className="text-coffee-500">
                        Page {pagination.current_page} of {pagination.last_page}
                    </span>
                    <button
                        disabled={!pagination.next_page_url}
                        onClick={() => fetchOrders(pagination.current_page + 1)}
                        className="px-4 py-2 border border-coffee-300 rounded-lg disabled:opacity-50 hover:bg-coffee-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
