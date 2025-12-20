import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CreditCard,
    Banknote,
    ChefHat,
    AlertCircle,
} from "lucide-react";
import { useCheckout } from "../../hooks/useCheckout";

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState("cash"); // 'cash' or 'online'
    const [notes, setNotes] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [validationError, setValidationError] = useState("");

    const { cart, getCartTotal, processCheckout, isProcessing, error } =
        useCheckout();

    if (cart.length === 0) {
        navigate("/menu");
        return null;
    }

    const handlePlaceOrder = async () => {
        setValidationError("");

        if (!customerName.trim()) {
            setValidationError("Nama pelanggan wajib diisi");
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        if (!["cash", "online"].includes(paymentMethod)) {
            setValidationError("Metode pembayaran tidak valid");
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        const formData = {
            customerName: customerName,
            paymentMethod: paymentMethod,
            notes: notes,
        };

        await processCheckout(formData);
    };

    return (
        <div className="min-h-screen bg-coffee-50 text-coffee-800 pb-24 lg:pb-8">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center">
                    <button
                        onClick={() => navigate("/menu")}
                        className="mr-4 text-coffee-600 hover:text-coffee-800 transition-colors"
                    >
                        <ArrowLeft />
                    </button>
                    <h1 className="text-fluid-h1 font-bold">Checkout</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                {(error || validationError) && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center mb-6">
                        <AlertCircle className="mr-2" size={20} />
                        {error || validationError}
                    </div>
                )}

                <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
                    {/* Left Column: Forms */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                        {/* Customer Info */}
                        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                            <label className="font-bold text-fluid-h2 mb-4 block">
                                Customer Name{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => {
                                    setCustomerName(e.target.value);
                                    if (validationError) setValidationError("");
                                }}
                                placeholder="Nama Pemesan (Wajib)"
                                className={`w-full border rounded-lg p-3 focus:ring-2 focus:outline-none transition-shadow ${
                                    validationError
                                        ? "border-red-500 focus:ring-red-200"
                                        : "border-coffee-200 focus:ring-coffee-500"
                                }`}
                            />
                            {validationError && (
                                <p className="text-red-500 text-sm mt-1">
                                    {validationError}
                                </p>
                            )}
                        </div>

                        {/* Notes */}
                        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                            <label className="font-bold text-fluid-h2 mb-4 block">
                                Notes (Optional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ex: Jangan terlalu pedas, es dipisah..."
                                className="w-full border border-coffee-200 rounded-lg p-3 focus:ring-2 focus:ring-coffee-500 focus:outline-none transition-shadow"
                                rows="3"
                            />
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                            <h2 className="font-bold text-fluid-h2 mb-4">
                                Payment Method
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                        onChange={() =>
                                            setPaymentMethod("cash")
                                        }
                                        className="hidden"
                                    />
                                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4 shrink-0">
                                        <Banknote size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold truncate">
                                            Bayar di Kasir (Cash)
                                        </div>
                                        <div className="text-sm text-coffee-500 truncate">
                                            Bayar tunai setelah makan
                                        </div>
                                    </div>
                                    {paymentMethod === "cash" && (
                                        <div className="w-5 h-5 rounded-full bg-coffee-600 flex items-center justify-center shrink-0 ml-2">
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
                                        onChange={() =>
                                            setPaymentMethod("online")
                                        }
                                        className="hidden"
                                    />
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4 shrink-0">
                                        <CreditCard size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold truncate">
                                            QRIS / E-Wallet
                                        </div>
                                        <div className="text-sm text-coffee-500 truncate">
                                            Scan QRIS atau GoPay/OVO
                                        </div>
                                    </div>
                                    {paymentMethod === "online" && (
                                        <div className="w-5 h-5 rounded-full bg-coffee-600 flex items-center justify-center shrink-0 ml-2">
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Summary (Sticky on Desktop) */}
                    <div className="lg:col-span-5 xl:col-span-4 mt-6 lg:mt-0 lg:sticky lg:top-24">
                        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                            <h2 className="font-bold text-fluid-h2 mb-4 flex items-center">
                                <ChefHat
                                    className="mr-2 text-coffee-600"
                                    size={20}
                                />
                                Order Summary
                            </h2>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {cart.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-start pb-4 border-b border-coffee-100 last:border-0 last:pb-0"
                                    >
                                        <div className="flex-1 mr-4">
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
                                        <div className="font-medium text-coffee-600 whitespace-nowrap">
                                            Rp{" "}
                                            {(
                                                (parseFloat(item.price) +
                                                    (item.modifiers?.reduce(
                                                        (s, m) =>
                                                            s +
                                                            parseFloat(m.price),
                                                        0
                                                    ) || 0)) *
                                                item.quantity
                                            ).toLocaleString("id-ID")}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-4 border-t border-coffee-100">
                                <div className="flex justify-between items-center font-bold text-xl mb-6">
                                    <span>Total</span>
                                    <span className="text-coffee-700">
                                        Rp{" "}
                                        {getCartTotal().toLocaleString("id-ID")}
                                    </span>
                                </div>

                                {/* Desktop Button */}
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessing}
                                    className="hidden lg:flex w-full bg-coffee-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-coffee-900 disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center space-x-2 transition-colors shadow-lg shadow-coffee-800/20"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <span>Place Order</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-coffee-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
                <div className="container mx-auto">
                    <button
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                        className="w-full bg-coffee-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-coffee-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-coffee-800/20"
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
