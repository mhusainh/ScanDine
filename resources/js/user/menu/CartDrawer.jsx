import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CartDrawer = ({ isOpen, onClose, cart, updateQuantity, total }) => {
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                        }}
                        className="fixed bottom-0 left-0 right-0 sm:top-0 sm:right-0 sm:left-auto sm:w-96 sm:h-full bg-white z-50 rounded-t-2xl sm:rounded-none sm:rounded-l-2xl shadow-xl flex flex-col max-h-[90vh] sm:max-h-screen"
                    >
                        <div className="p-4 border-b border-coffee-100 flex items-center justify-between bg-coffee-50/50">
                            <h2 className="text-lg font-bold text-coffee-900 flex items-center gap-2">
                                <span>🛒</span> Your Order
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-coffee-100 rounded-full text-coffee-500 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-coffee-400 space-y-4">
                                    <div className="w-20 h-20 bg-coffee-50 rounded-full flex items-center justify-center text-4xl shadow-inner">
                                        ☕
                                    </div>
                                    <p className="font-medium">
                                        Your cart is empty
                                    </p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div
                                        key={item.cartId}
                                        className="flex flex-col border-b border-coffee-50 pb-4 last:border-0"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-coffee-800">
                                                    {item.name}
                                                </h4>
                                                {item.modifiers &&
                                                    item.modifiers.length >
                                                        0 && (
                                                        <div className="text-xs text-coffee-500 mt-1 space-y-0.5">
                                                            {item.modifiers.map(
                                                                (mod, idx) => (
                                                                    <div
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="flex justify-between w-full max-w-[200px]"
                                                                    >
                                                                        <span>
                                                                            +{" "}
                                                                            {
                                                                                mod.name
                                                                            }
                                                                        </span>
                                                                        {mod.price >
                                                                            0 && (
                                                                            <span>
                                                                                {mod.price.toLocaleString()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                <div className="text-sm font-bold text-coffee-700 mt-1">
                                                    Rp{" "}
                                                    {(
                                                        (item.price +
                                                            (item.modifiers?.reduce(
                                                                (s, m) =>
                                                                    s + m.price,
                                                                0
                                                            ) || 0)) *
                                                        item.quantity
                                                    ).toLocaleString("id-ID")}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <div className="flex items-center space-x-3 bg-coffee-100 rounded-lg p-1">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.cartId,
                                                            -1
                                                        )
                                                    }
                                                    className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-coffee-600 hover:text-coffee-800 active:scale-95"
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm font-bold w-6 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.cartId,
                                                            1
                                                        )
                                                    }
                                                    className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-coffee-600 hover:text-coffee-800 active:scale-95"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-coffee-100 bg-coffee-50 sm:rounded-bl-2xl">
                            <div className="flex justify-between mb-4 text-lg font-bold text-coffee-800">
                                <span>Total</span>
                                <span>Rp {total.toLocaleString("id-ID")}</span>
                            </div>
                            <button
                                onClick={() => {
                                    onClose();
                                    navigate("/checkout");
                                }}
                                disabled={cart.length === 0}
                                className="w-full bg-coffee-800 text-white py-3 rounded-xl font-bold hover:bg-coffee-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-coffee-200"
                            >
                                Checkout
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
