import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import PropTypes from "prop-types";

/**
 * ProductDetailDrawer Component
 * Allows users to select product modifiers and quantity before adding to cart.
 * 
 * @component
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the drawer is open
 * @param {function} props.onClose - Function to close the drawer
 * @param {object} props.product - The product to display
 */
const ProductDetailDrawer = ({ isOpen, onClose, product }) => {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedModifiers, setSelectedModifiers] = useState([]);

    // Reset state when product changes
    useEffect(() => {
        if (isOpen) {
            setQuantity(1);
            setSelectedModifiers([]);
        }
    }, [isOpen, product]);

    const modifierGroups = useMemo(() => [
        {
            id: 1,
            name: "Level Pedas",
            type: "single_choice",
            required: true,
            items: [
                { id: 101, name: "Tidak Pedas", price: 0 },
                { id: 102, name: "Sedang", price: 0 },
                { id: 103, name: "Pedas", price: 2000 },
            ],
        },
        {
            id: 2,
            name: "Topping Tambahan",
            type: "multiple_choice",
            required: false,
            items: [
                { id: 201, name: "Keju", price: 5000 },
                { id: 202, name: "Telur", price: 4000 },
            ],
        },
    ], []);

    if (!isOpen || !product) return null;

    const handleModifierToggle = (group, item) => {
        if (group.type === "single_choice") {
            setSelectedModifiers((prev) => [
                ...prev.filter((m) => m.groupId !== group.id),
                { ...item, groupId: group.id, groupName: group.name },
            ]);
        } else {
            const exists = selectedModifiers.find((m) => m.id === item.id);
            setSelectedModifiers((prev) =>
                exists ? prev.filter((m) => m.id !== item.id) : [...prev, { ...item, groupId: group.id, groupName: group.name }]
            );
        }
    };

    const calculateTotal = () => {
        const modifiersTotal = selectedModifiers.reduce((sum, m) => sum + m.price, 0);
        return (product.price + modifiersTotal) * quantity;
    };

    const handleAddToCart = () => {
        const missingRequired = modifierGroups.filter(
            (g) => g.required && !selectedModifiers.find((m) => m.groupId === g.id)
        );

        if (missingRequired.length > 0) {
            alert(`Mohon pilih ${missingRequired[0].name}`);
            return;
        }

        addToCart(product, quantity, selectedModifiers);
        onClose();
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
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl shadow-xl max-h-[90vh] flex flex-col"
                    >
                         <div className="p-4 border-b border-coffee-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-coffee-900">{product.name}</h2>
                            <button onClick={onClose} className="p-2 hover:bg-coffee-50 rounded-full">
                                <X size={24} className="text-coffee-500" />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1">
                            <p className="text-coffee-600 mb-6">{product.description}</p>
                            
                            {modifierGroups.map((group) => (
                                <div key={group.id} className="mb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-bold text-coffee-800">{group.name}</h3>
                                        {group.required && <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded">Wajib</span>}
                                    </div>
                                    <div className="space-y-2">
                                        {group.items.map((item) => {
                                            const isSelected = selectedModifiers.find((m) => m.id === item.id);
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => handleModifierToggle(group, item)}
                                                    className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
                                                        isSelected
                                                            ? "border-coffee-500 bg-coffee-50 ring-1 ring-coffee-500"
                                                            : "border-coffee-200 hover:border-coffee-300"
                                                    }`}
                                                >
                                                    <span className={`font-medium ${isSelected ? "text-coffee-900" : "text-coffee-600"}`}>
                                                        {item.name}
                                                    </span>
                                                    {item.price > 0 && (
                                                        <span className="text-sm text-coffee-500">
                                                            +Rp {item.price.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-coffee-100 bg-coffee-50/50">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-bold text-coffee-900">Jumlah</span>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-8 rounded-full bg-white border border-coffee-200 flex items-center justify-center text-coffee-600 hover:bg-coffee-100 disabled:opacity-50"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-8 h-8 rounded-full bg-coffee-800 text-white flex items-center justify-center hover:bg-coffee-900"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-coffee-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-coffee-800 transition-colors flex justify-between px-6"
                            >
                                <span>Tambah ke Keranjang</span>
                                <span>Rp {calculateTotal().toLocaleString()}</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

ProductDetailDrawer.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    product: PropTypes.object
};

export default ProductDetailDrawer;
