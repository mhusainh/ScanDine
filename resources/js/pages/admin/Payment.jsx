import React, { useState } from "react";
import {
    Search,
    Receipt,
    CheckCircle,
    Clock,
    User,
    Table,
    ShoppingBag,
} from "lucide-react";
import axios from "../../libs/axios";

const PaymentPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchQuery.trim()) {
            setError("Masukkan nomor order");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage("");
        setOrder(null);

        try {
            const response = await axios.get(
                `/api/admin/orders/search/${searchQuery.trim()}`
            );

            if (response.data.success) {
                setOrder(response.data.data);
            } else {
                setError("Order tidak ditemukan");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Gagal mencari order");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!order) return;

        setConfirming(true);
        setError(null);
        setSuccessMessage("");

        try {
            const response = await axios.post(
                `/api/admin/orders/${order.id}/confirm-payment`
            );

            if (response.data.success) {
                setSuccessMessage("Pembayaran berhasil dikonfirmasi!");
                // Update order status
                setOrder({
                    ...order,
                    payment_status: "paid",
                    status: "confirmed",
                    payment: {
                        ...order.payment,
                        payment_status: "settlement",
                        paid_at: new Date().toISOString(),
                    },
                });

                // Clear search after 2 seconds
                setTimeout(() => {
                    setSearchQuery("");
                    setOrder(null);
                    setSuccessMessage("");
                }, 3000);
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "Gagal konfirmasi pembayaran"
            );
        } finally {
            setConfirming(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-coffee-900 mb-2">
                    Konfirmasi Pembayaran
                </h1>
                <p className="text-coffee-600">
                    Cari order dan konfirmasi pembayaran cash dari customer
                </p>
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-coffee-100">
                    <label className="block text-sm font-medium text-coffee-700 mb-2">
                        Nomor Order
                    </label>
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400"
                                size={20}
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Masukkan nomor order (contoh: ORD-20251221-003)"
                                className="w-full pl-10 pr-4 py-3 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-coffee-800 text-white rounded-lg hover:bg-coffee-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                            {loading ? "Mencari..." : "Cari"}
                        </button>
                    </div>
                </div>
            </form>

            {/* Error Message */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Success Message */}
            {successMessage && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
                    <CheckCircle className="mr-2" size={20} />
                    {successMessage}
                </div>
            )}

            {/* Order Details */}
            {order && (
                <div className="bg-white rounded-xl shadow-lg border border-coffee-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-coffee-800 to-coffee-900 text-white p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">
                                    {order.order_number}
                                </h2>
                                <p className="text-coffee-100">
                                    {new Date(order.created_at).toLocaleString(
                                        "id-ID",
                                        {
                                            dateStyle: "full",
                                            timeStyle: "short",
                                        }
                                    )}
                                </p>
                            </div>
                            <div className="text-right">
                                <div
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        order.payment_status === "paid"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                    }`}
                                >
                                    {order.payment_status === "paid" ? (
                                        <>
                                            <CheckCircle
                                                className="mr-1"
                                                size={16}
                                            />
                                            Terbayar
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="mr-1" size={16} />
                                            Belum Bayar
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Customer & Table Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-coffee-50 rounded-lg p-4">
                                <div className="flex items-center text-coffee-600 mb-2">
                                    <User className="mr-2" size={18} />
                                    <span className="text-sm font-medium">
                                        Customer
                                    </span>
                                </div>
                                <div className="font-bold text-coffee-900">
                                    {order.customer_name || "Guest"}
                                </div>
                            </div>
                            <div className="bg-coffee-50 rounded-lg p-4">
                                <div className="flex items-center text-coffee-600 mb-2">
                                    <Table className="mr-2" size={18} />
                                    <span className="text-sm font-medium">
                                        Meja
                                    </span>
                                </div>
                                <div className="font-bold text-coffee-900">
                                    {order.table?.table_number ||
                                        order.table?.name ||
                                        "-"}
                                </div>
                            </div>
                            <div className="bg-coffee-50 rounded-lg p-4">
                                <div className="flex items-center text-coffee-600 mb-2">
                                    <Receipt className="mr-2" size={18} />
                                    <span className="text-sm font-medium">
                                        Metode Pembayaran
                                    </span>
                                </div>
                                <div className="font-bold text-coffee-900 capitalize">
                                    {order.payment_method === "cash"
                                        ? "Tunai"
                                        : "Online"}
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <div className="flex items-center mb-4">
                                <ShoppingBag
                                    className="mr-2 text-coffee-600"
                                    size={20}
                                />
                                <h3 className="font-bold text-lg text-coffee-900">
                                    Detail Pesanan
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {order.order_items?.map((item, index) => (
                                    <div
                                        key={index}
                                        className="bg-coffee-50 rounded-lg p-4"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <div className="font-bold text-coffee-900">
                                                    {item.quantity}x{" "}
                                                    {item.menu_item?.name ||
                                                        "Menu Item"}
                                                </div>
                                                <div className="text-sm text-coffee-600">
                                                    Rp{" "}
                                                    {parseFloat(
                                                        item.price
                                                    ).toLocaleString(
                                                        "id-ID"
                                                    )}{" "}
                                                    × {item.quantity}
                                                </div>
                                            </div>
                                            <div className="font-bold text-coffee-900">
                                                Rp{" "}
                                                {(
                                                    parseFloat(item.price) *
                                                    item.quantity
                                                ).toLocaleString("id-ID")}
                                            </div>
                                        </div>

                                        {/* Modifiers */}
                                        {item.order_item_modifiers &&
                                            item.order_item_modifiers.length >
                                                0 && (
                                                <div className="ml-4 pt-2 border-t border-coffee-200 space-y-1">
                                                    {item.order_item_modifiers.map(
                                                        (mod, modIndex) => (
                                                            <div
                                                                key={modIndex}
                                                                className="flex justify-between text-sm"
                                                            >
                                                                <div className="text-coffee-600">
                                                                    +{" "}
                                                                    {mod
                                                                        .modifier_item
                                                                        ?.name ||
                                                                        "Add-on"}
                                                                </div>
                                                                {parseFloat(
                                                                    mod.price
                                                                ) > 0 && (
                                                                    <div className="text-coffee-600">
                                                                        Rp{" "}
                                                                        {(
                                                                            parseFloat(
                                                                                mod.price
                                                                            ) *
                                                                            mod.quantity
                                                                        ).toLocaleString(
                                                                            "id-ID"
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}

                                        {/* Item Notes */}
                                        {item.notes && (
                                            <div className="mt-2 text-sm text-coffee-600 italic">
                                                Catatan: {item.notes}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Notes */}
                        {order.notes && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="text-sm text-yellow-800 font-medium mb-1">
                                    Catatan Pesanan:
                                </div>
                                <div className="text-yellow-900">
                                    {order.notes}
                                </div>
                            </div>
                        )}

                        {/* Total */}
                        <div className="bg-coffee-900 rounded-xl p-5 text-white">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold">
                                    Total Pembayaran
                                </span>
                                <span className="text-3xl font-bold">
                                    Rp{" "}
                                    {parseFloat(
                                        order.total_amount
                                    ).toLocaleString("id-ID")}
                                </span>
                            </div>
                        </div>

                        {/* Confirm Button */}
                        {order.payment_status !== "paid" &&
                            order.payment_method === "cash" && (
                                <button
                                    onClick={handleConfirmPayment}
                                    disabled={confirming}
                                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors shadow-lg"
                                >
                                    {confirming ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={24} />
                                            <span>Konfirmasi Terbayar</span>
                                        </>
                                    )}
                                </button>
                            )}

                        {order.payment_status === "paid" && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center font-medium">
                                ✓ Pembayaran telah dikonfirmasi pada{" "}
                                {order.payment?.paid_at &&
                                    new Date(
                                        order.payment.paid_at
                                    ).toLocaleString("id-ID")}
                            </div>
                        )}

                        {order.payment_method === "online" &&
                            order.payment_status !== "paid" && (
                                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-center">
                                    Pembayaran online - menunggu konfirmasi dari
                                    payment gateway
                                </div>
                            )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentPage;
