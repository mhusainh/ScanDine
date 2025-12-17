import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, ChefHat, RotateCcw } from "lucide-react";
import axios from "axios";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        // Poll every 30 seconds
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get("/api/admin/orders");
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await axios.post(`/api/admin/orders/${orderId}/status`, {
                status: newStatus,
            });
            // Optimistic update
            setOrders(
                orders.map((o) =>
                    o.id === orderId ? { ...o, status: newStatus } : o
                )
            );
            // Or refetch
            fetchOrders();
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
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
            default:
                return "bg-stone-100 text-stone-800 border-stone-200";
        }
    };

    if (loading)
        return <div className="p-6 text-center">Loading orders...</div>;

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-stone-800">
                        Kitchen Display System (KDS)
                    </h1>
                    <p className="text-stone-500">
                        Manage active orders from the kitchen
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2"
                >
                    <RotateCcw size={16} /> Refresh
                </button>
            </header>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-stone-300">
                    <div className="text-stone-400 mb-2">No active orders</div>
                    <p className="text-sm text-stone-500">
                        New orders will appear here automatically
                    </p>
                </div>
            ) : (
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
                                        className="col-span-2 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2 transition-colors"
                                    >
                                        <ChefHat size={18} />
                                        <span>Start Cooking</span>
                                    </button>
                                )}
                                {order.status === "cooking" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(order.id, "ready")
                                        }
                                        className="col-span-2 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center space-x-2 transition-colors"
                                    >
                                        <CheckCircle size={18} />
                                        <span>Mark Ready</span>
                                    </button>
                                )}
                                {order.status === "ready" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(order.id, "completed")
                                        }
                                        className="col-span-2 bg-stone-800 text-white py-2 rounded-lg font-medium hover:bg-stone-900 flex items-center justify-center space-x-2 transition-colors"
                                    >
                                        <CheckCircle size={18} />
                                        <span>Complete</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
