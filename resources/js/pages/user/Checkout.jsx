import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Banknote, ChefHat } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useCheckout } from "../../hooks/useCheckout";

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState("cash"); // 'cash' or 'online'
    const [notes, setNotes] = useState("");
    const [customerName, setCustomerName] = useState("");

    const {
        cart,
        getCartTotal,
        processCheckout,
        isProcessing,
        error
    } = useCheckout();

    if (cart.length === 0) {
        navigate("/menu");
        return null;
    }

    const handlePlaceOrder = async () => {
        const formData = {
            customerName: customerName || "Guest",
            paymentMethod: paymentMethod,
            notes: notes,
        };

        await processCheckout(formData);
    };

    return (
        <div className="min-h-screen bg-coffee-50 text-coffee-800 pb-24">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center">
                    <button
                        onClick={() => navigate("/menu")}
                        className="mr-4 text-coffee-600"
                    >
                        <ArrowLeft />
                    </button>
                    <h1 className="text-xl font-bold">Checkout</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Order Summary */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <h2 className="font-bold text-lg mb-4 flex items-center">
                        <ChefHat className="mr-2 text-coffee-600" size={20} />
                        Order Summary
                    </h2>
                    <div className="space-y-4">
                        {cart.map((item, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-start pb-4 border-b border-coffee-100 last:border-0 last:pb-0"
                            >
                                <div className="flex-1">
                                    <div className="font-medium">
                                        {item.quantity}x {item.name}
                                    </div>
                                    {item.modifiers &&
                                        item.modifiers.length > 0 && (
                                            <div className="text-sm text-coffee-500 mt-1">
                                                {item.modifiers
                                                    .map((m) => m.name)
                                                    .join(", ")}
                                            </div>
                                        )}
                                </div>
                                <div className="font-medium text-coffee-600">
                                    Rp{" "}
                                    {(
                                        (item.price +
                                            (item.modifiers?.reduce(
                                                (s, m) => s + m.price,
                                                0
                                            ) || 0)) *
                                        item.quantity
                                    ).toLocaleString("id-ID")}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-coffee-100 flex justify-between items-center font-bold text-lg">
                        <span>Total</span>
                        <span className="text-coffee-700">
                            Rp {getCartTotal().toLocaleString("id-ID")}
                        </span>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <label className="font-bold text-lg mb-2 block">
                        Customer Name
                    </label>
                    <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Your Name (Optional)"
                        className="w-full border border-coffee-200 rounded-lg p-3 focus:ring-2 focus:ring-coffee-500 focus:outline-none"
                    />
                </div>

                {/* Notes */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <label className="font-bold text-lg mb-2 block">
                        Notes (Optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ex: Jangan terlalu pedas, es dipisah..."
                        className="w-full border border-coffee-200 rounded-lg p-3 focus:ring-2 focus:ring-coffee-500 focus:outline-none"
                        rows="3"
                    />
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <h2 className="font-bold text-lg mb-4">Payment Method</h2>
                    <div className="space-y-3">
                        <label
                            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                paymentMethod === "cash"
                                    ? "border-coffee-600 bg-coffee-50"
                                    : "border-coffee-100 hover:border-coffee-200"
                            }`}
                        >
                            <input
                                type="radio"
                                name="payment"
                                value="cash"
                                checked={paymentMethod === "cash"}
                                onChange={() => setPaymentMethod("cash")}
                                className="hidden"
                            />
                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4">
                                <Banknote size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold">
                                    Bayar di Kasir (Cash)
                                </div>
                                <div className="text-sm text-coffee-500">
                                    Bayar tunai setelah makan
                                </div>
                            </div>
                            {paymentMethod === "cash" && (
                                <div className="w-5 h-5 rounded-full bg-coffee-600 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                            )}
                        </label>

                        <label
                            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                paymentMethod === "online"
                                    ? "border-coffee-600 bg-coffee-50"
                                    : "border-coffee-100 hover:border-coffee-200"
                            }`}
                        >
                            <input
                                type="radio"
                                name="payment"
                                value="online"
                                checked={paymentMethod === "online"}
                                onChange={() => setPaymentMethod("online")}
                                className="hidden"
                            />
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4">
                                <CreditCard size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold">QRIS / E-Wallet</div>
                                <div className="text-sm text-coffee-500">
                                    Scan QRIS atau GoPay/OVO
                                </div>
                            </div>
                            {paymentMethod === "online" && (
                                <div className="w-5 h-5 rounded-full bg-coffee-600 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                            )}
                        </label>
                    </div>
                </div>
            </main>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-coffee-100 p-4 shadow-lg">
                <div className="container mx-auto">
                    <button
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                        className="w-full bg-coffee-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-coffee-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <span>
                                Place Order - Rp{" "}
                                {getCartTotal().toLocaleString("id-ID")}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
