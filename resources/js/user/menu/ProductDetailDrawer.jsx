import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { useCart } from "../../context/CartContext";

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

    if (!isOpen || !product) return null;

    // Dummy modifiers for now (since we don't have them in the initial product list)
    // In real app, this would come from product.modifier_groups
    const modifierGroups = [
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
    ];

    const handleModifierToggle = (group, item) => {
        if (group.type === "single_choice") {
            // Remove other items from same group, add new one
            setSelectedModifiers((prev) => [
                ...prev.filter((m) => m.groupId !== group.id),
                { ...item, groupId: group.id, groupName: group.name },
            ]);
        } else {
            // Toggle item
            const exists = selectedModifiers.find((m) => m.id === item.id);
            if (exists) {
                setSelectedModifiers((prev) =>
                    prev.filter((m) => m.id !== item.id)
                );
            } else {
                setSelectedModifiers((prev) => [
                    ...prev,
                    { ...item, groupId: group.id, groupName: group.name },
                ]);
            }
        }
    };

    const calculateTotal = () => {
        const modifiersTotal = selectedModifiers.reduce(
            (sum, m) => sum + m.price,
            0
        );
        return (product.price + modifiersTotal) * quantity;
    };

    const handleAddToCart = () => {
        // Validate required modifiers
        const missingRequired = modifierGroups.filter(
            (g) =>
                g.required && !selectedModifiers.find((m) => m.groupId === g.id)
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
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
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
                        className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl max-h-[90vh] flex flex-col shadow-2xl"
                    >
                        {/* Header Image */}
                        <div className="relative h-48 sm:h-64 flex-shrink-0">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-t-2xl"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full shadow-lg border border-white/30 text-white hover:bg-white/30 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
                            <div>
                                <h2 className="text-2xl font-bold text-coffee-900 mb-1">
                                    {product.name}
                                </h2>
                                <p className="text-coffee-600 text-sm leading-relaxed">
                                    {product.description}
                                </p>
                                <div className="mt-2 text-xl font-bold text-coffee-800">
                                    Rp {product.price.toLocaleString("id-ID")}
                                </div>
                            </div>

                            <hr className="border-coffee-100" />

                            {/* Modifiers */}
                            {modifierGroups.map((group) => (
                                <div key={group.id} className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-coffee-800">
                                            {group.name}
                                        </h3>
                                        {group.required && (
                                            <span className="text-xs font-medium bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                                Wajib
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {group.items.map((item) => {
                                            const isSelected =
                                                selectedModifiers.find(
                                                    (m) => m.id === item.id
                                                );
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() =>
                                                        handleModifierToggle(
                                                            group,
                                                            item
                                                        )
                                                    }
                                                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                                                        isSelected
                                                            ? "border-coffee-600 bg-coffee-50 shadow-sm"
                                                            : "border-coffee-100 hover:border-coffee-300 hover:bg-coffee-50/50"
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div
                                                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                                                isSelected
                                                                    ? "border-coffee-600 bg-coffee-600"
                                                                    : "border-coffee-300"
                                                            }`}
                                                        >
                                                            {isSelected && (
                                                                <div className="w-2 h-2 bg-white rounded-full" />
                                                            )}
                                                        </div>
                                                        <span
                                                            className={`font-medium ${
                                                                isSelected
                                                                    ? "text-coffee-900"
                                                                    : "text-coffee-700"
                                                            }`}
                                                        >
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                    {item.price > 0 && (
                                                        <span className="text-coffee-500 text-sm font-medium">
                                                            +Rp{" "}
                                                            {item.price.toLocaleString(
                                                                "id-ID"
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Action Bar */}
                        <div className="p-4 border-t border-coffee-100 bg-white pb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3 bg-coffee-50 rounded-xl p-2 border border-coffee-100">
                                    <button
                                        onClick={() =>
                                            setQuantity(
                                                Math.max(1, quantity - 1)
                                            )
                                        }
                                        className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-coffee-700 active:scale-95 transition-transform hover:bg-coffee-100"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <span className="font-bold text-xl w-8 text-center text-coffee-900">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setQuantity(quantity + 1)
                                        }
                                        className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-coffee-700 active:scale-95 transition-transform hover:bg-coffee-100"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-coffee-900 text-white p-4 rounded-xl font-bold text-lg shadow-lg shadow-coffee-900/20 active:scale-95 transition-all flex justify-between items-center hover:bg-coffee-800"
                                >
                                    <span>Add to Order</span>
                                    <span>
                                        Rp{" "}
                                        {calculateTotal().toLocaleString(
                                            "id-ID"
                                        )}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProductDetailDrawer;
