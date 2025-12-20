import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Home } from "lucide-react";

const SuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const order = location.state?.order;

    return (
        <div className="min-h-screen bg-coffee-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                    <CheckCircle size={40} strokeWidth={3} />
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-coffee-800 mb-2">
                        Order Confirmed!
                    </h1>
                    <p className="text-coffee-600">
                        Pesanan Anda telah diterima dan sedang disiapkan oleh
                        dapur kami.
                    </p>
                </div>

                <div className="bg-coffee-50 rounded-xl p-4 text-left space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-coffee-600">Order ID</span>
                        <span className="font-bold font-mono">
                            {order?.order_number || "-"}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-coffee-600">Est. Time</span>
                        <span className="font-bold">15-20 Mins</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-coffee-600">Table</span>
                        <span className="font-bold">
                            {order?.table?.table_number ||
                                order?.table?.name ||
                                "-"}
                        </span>
                    </div>
                    {order?.total_amount && (
                        <div className="flex justify-between text-sm pt-2 border-t border-coffee-200 mt-2">
                            <span className="text-coffee-600 font-medium">
                                Total
                            </span>
                            <span className="font-bold text-coffee-900">
                                Rp{" "}
                                {parseFloat(order.total_amount).toLocaleString(
                                    "id-ID"
                                )}
                            </span>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => navigate("/menu")}
                    className="w-full bg-coffee-900 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-coffee-800"
                >
                    <Home size={18} />
                    <span>Back to Menu</span>
                </button>
            </div>
        </div>
    );
};

export default SuccessPage;
