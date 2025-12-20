import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import PropTypes from "prop-types";

/**
 * CartDrawer Component
 * Displays the current cart contents in a slide-up drawer with quantity controls and checkout button.
 *
 * @component
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the drawer is open
 * @param {function} props.onClose - Function to close the drawer
 * @param {Array} props.cart - List of items in cart
 * @param {function} props.updateQuantity - Function to update item quantity (id, delta)
 * @param {number} props.total - Total price of items in cart
 */
const CartDrawer = ({ isOpen, onClose, cart, updateQuantity, total }) => {
    const navigate = useNavigate();

    const handleCheckout = () => {
        onClose();
        navigate("/checkout");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                        onClick={onClose}
                    />

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
                                <ShoppingBag size={20} /> Your Order
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-coffee-100 rounded-full text-coffee-500 transition-colors"
                                data-testid="close-cart-btn"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {cart.length === 0 ? (
                                <div
                                    className="flex flex-col items-center justify-center h-full text-coffee-400 space-y-4"
                                    data-testid="empty-cart-msg"
                                >
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
                                        data-testid={`cart-item-${item.cartId}`}
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
                                                        item.price +
                                                        (item.modifiers?.reduce(
                                                            (s, m) =>
                                                                s + m.price,
                                                            0
                                                        ) || 0)
                                                    ).toLocaleString()}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 bg-coffee-50 rounded-lg p-1">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.cartId,
                                                            -1
                                                        )
                                                    }
                                                    className="p-1 hover:bg-white rounded shadow-sm text-coffee-600 transition-colors"
                                                    disabled={
                                                        item.quantity <= 0
                                                    }
                                                    data-testid={`minus-btn-${item.cartId}`}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span
                                                    className="text-sm font-bold w-4 text-center text-coffee-800"
                                                    data-testid={`qty-${item.cartId}`}
                                                >
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.cartId,
                                                            1
                                                        )
                                                    }
                                                    className="p-1 hover:bg-white rounded shadow-sm text-coffee-600 transition-colors"
                                                    data-testid={`plus-btn-${item.cartId}`}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-4 border-t border-coffee-100 bg-coffee-50/50">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-coffee-600 font-medium">
                                        Total
                                    </span>
                                    <span className="text-xl font-bold text-coffee-900">
                                        Rp {total.toLocaleString()}
                                    </span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-coffee-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-coffee-800 transition-colors flex justify-between px-6"
                                    data-testid="checkout-btn"
                                >
                                    <span>Checkout</span>
                                    <span>→</span>
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

CartDrawer.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    cart: PropTypes.array.isRequired,
    updateQuantity: PropTypes.func.isRequired,
    total: PropTypes.number.isRequired,
};

export default CartDrawer;
