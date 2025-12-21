import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Clock, Home, Receipt, ShoppingBag } from "lucide-react";

const PendingPaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const hasCheckedRef = useRef(false);

    const order = location.state?.order;

    useEffect(() => {
        // Only check once to avoid infinite loop
        if (hasCheckedRef.current) return;
        hasCheckedRef.current = true;

        console.log("PendingPayment mounted - order:", order);

        if (!order) {
            console.log("No order found, redirecting to menu");
            setTimeout(() => {
                navigate("/menu", { replace: true });
            }, 100);
        }
    }, []);

    // Don't render if no order
    if (!order) {
        return (
            <div className="min-h-screen bg-coffee-50 flex items-center justify-center">
                <div className="text-coffee-800">Redirecting...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-coffee-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Clock size={32} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">
                            Pesanan Diterima
                        </h1>
                        <p className="text-orange-50">
                            Silahkan menuju kasir untuk melakukan pembayaran
                        </p>
                    </div>

                    {/* Order Info */}
                    <div className="p-6 space-y-6">
                        {/* Order Number */}
                        <div className="bg-coffee-50 rounded-xl p-4 border-2 border-dashed border-coffee-200">
                            <div className="text-center">
                                <div className="text-sm text-coffee-600 mb-1">
                                    Nomor Pesanan
                                </div>
                                <div className="text-2xl font-bold font-mono text-coffee-900">
                                    {order.order_number}
                                </div>
                            </div>
                        </div>

                        {/* Customer & Table Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-coffee-50 rounded-xl p-4">
                                <div className="text-sm text-coffee-600 mb-1">
                                    Nama Pemesan
                                </div>
                                <div className="font-bold text-coffee-900">
                                    {order.customer_name || "Guest"}
                                </div>
                            </div>
                            <div className="bg-coffee-50 rounded-xl p-4">
                                <div className="text-sm text-coffee-600 mb-1">
                                    Meja
                                </div>
                                <div className="font-bold text-coffee-900">
                                    {order.table?.table_number ||
                                        order.table?.name ||
                                        "-"}
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
                                <h2 className="font-bold text-lg text-coffee-900">
                                    Detail Pesanan
                                </h2>
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
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                    <Receipt className="mr-2" size={20} />
                                    <span className="text-lg font-bold">
                                        Total Pembayaran
                                    </span>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-right">
                                Rp{" "}
                                {parseFloat(order.total_amount).toLocaleString(
                                    "id-ID"
                                )}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <h3 className="font-bold text-blue-900 mb-2">
                                Langkah Selanjutnya:
                            </h3>
                            <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
                                <li>Tunjukkan nomor pesanan ini ke kasir</li>
                                <li>Lakukan pembayaran sesuai total di atas</li>
                                <li>Pesanan Anda akan segera disiapkan</li>
                            </ol>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => navigate("/menu")}
                            className="w-full bg-coffee-900 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-coffee-800 transition-colors shadow-lg"
                        >
                            <Home size={20} />
                            <span>Kembali ke Menu</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingPaymentPage;
