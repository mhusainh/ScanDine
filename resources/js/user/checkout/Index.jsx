import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Banknote, ChefHat } from "lucide-react";
import { useCart } from "../../context/CartContext";

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cart, getCartTotal, clearCart } = useCart();
    const [paymentMethod, setPaymentMethod] = useState("cash"); // 'cash' or 'online'
    const [notes, setNotes] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    if (cart.length === 0) {
        navigate("/menu");
        return null;
    }

    const handlePlaceOrder = async () => {
        setIsProcessing(true);

        // Simulation of API Call
        setTimeout(() => {
            setIsProcessing(false);
            clearCart();
            navigate("/success");
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 pb-24">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center">
                    <button
                        onClick={() => navigate("/menu")}
                        className="mr-4 text-stone-600"
                    >
                        <ArrowLeft />
                    </button>
                    <h1 className="text-xl font-bold">Checkout</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 space-y-6">
                {/* Order Summary */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <h2 className="font-bold text-lg mb-4 flex items-center">
                        <ChefHat className="mr-2 text-amber-600" size={20} />
                        Order Summary
                    </h2>
                    <div className="space-y-4">
                        {cart.map((item, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-start pb-4 border-b border-stone-100 last:border-0 last:pb-0"
                            >
                                <div className="flex-1">
                                    <div className="font-medium">
                                        {item.quantity}x {item.name}
                                    </div>
                                    {item.modifiers &&
                                        item.modifiers.length > 0 && (
                                            <div className="text-sm text-stone-500 mt-1">
                                                {item.modifiers
                                                    .map((m) => m.name)
                                                    .join(", ")}
                                            </div>
                                        )}
                                </div>
                                <div className="font-medium text-stone-600">
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
                    <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-center font-bold text-lg">
                        <span>Total</span>
                        <span className="text-amber-700">
                            Rp {getCartTotal().toLocaleString("id-ID")}
                        </span>
                    </div>
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
                        className="w-full border border-stone-200 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
                                    ? "border-amber-600 bg-amber-50"
                                    : "border-stone-100 hover:border-stone-200"
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
                                <div className="text-sm text-stone-500">
                                    Bayar tunai setelah makan
                                </div>
                            </div>
                            {paymentMethod === "cash" && (
                                <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                            )}
                        </label>

                        <label
                            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                paymentMethod === "online"
                                    ? "border-amber-600 bg-amber-50"
                                    : "border-stone-100 hover:border-stone-200"
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
                                <div className="text-sm text-stone-500">
                                    Scan QRIS atau GoPay/OVO
                                </div>
                            </div>
                            {paymentMethod === "online" && (
                                <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                            )}
                        </label>
                    </div>
                </div>
            </main>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 p-4 shadow-lg">
                <div className="container mx-auto">
                    <button
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                        className="w-full bg-amber-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-amber-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
