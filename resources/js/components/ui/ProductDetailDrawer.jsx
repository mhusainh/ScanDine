import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";
import PropTypes from "prop-types";
import ImageWithFallback from "./ImageWithFallback";

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
    const { warning, success } = useToast();
    const [quantity, setQuantity] = useState(1);
    const [selectedModifiers, setSelectedModifiers] = useState([]);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Reset state when product changes
    useEffect(() => {
        if (isOpen) {
            setQuantity(1);
            setSelectedModifiers([]);
        }
    }, [isOpen, product]);

    const modifierGroups = product?.modifier_groups || [];

    if (!isOpen || !product) return null;

    const variants = isDesktop
        ? {
              hidden: { x: "100%", opacity: 0 },
              visible: { x: 0, opacity: 1 },
              exit: { x: "100%", opacity: 0 },
          }
        : {
              hidden: { y: "100%", opacity: 0 },
              visible: { y: 0, opacity: 1 },
              exit: { y: "100%", opacity: 0 },
          };

    const handleModifierToggle = (group, item) => {
        if (group.type === "single_choice") {
            setSelectedModifiers((prev) => [
                ...prev.filter((m) => m.groupId !== group.id),
                { ...item, groupId: group.id, groupName: group.name },
            ]);
        } else {
            const exists = selectedModifiers.find((m) => m.id === item.id);
            setSelectedModifiers((prev) =>
                exists
                    ? prev.filter((m) => m.id !== item.id)
                    : [
                          ...prev,
                          { ...item, groupId: group.id, groupName: group.name },
                      ]
            );
        }
    };

    const calculateTotal = () => {
        const modifiersTotal = selectedModifiers.reduce(
            (sum, m) => sum + parseFloat(m.price),
            0
        );
        return (parseFloat(product.price) + modifiersTotal) * quantity;
    };

    const handleAddToCart = () => {
        const missingRequired = modifierGroups.filter(
            (g) =>
                g.is_required &&
                !selectedModifiers.find((m) => m.groupId === g.id)
        );

        if (missingRequired.length > 0) {
            warning(`Mohon pilih ${missingRequired[0].name}`);
            return;
        }

        addToCart(product, quantity, selectedModifiers);
        success("Berhasil ditambahkan ke keranjang");
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
                        variants={variants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                        }}
                        className="fixed z-50 bg-white shadow-xl flex flex-col 
                            bottom-0 left-0 right-0 rounded-t-2xl max-h-[90vh] 
                            md:top-0 md:right-0 md:left-auto md:h-full md:w-[450px] md:max-h-full md:rounded-none md:rounded-l-2xl"
                    >
                        <div className="relative h-48 md:h-56 shrink-0">
                            <ImageWithFallback
                                src={product.url_file || product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                sizes="(max-width: 768px) 100vw, 450px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <div className="absolute bottom-4 left-4 right-4">
                                <h2 className="text-2xl font-bold text-white mb-1 shadow-black/10 drop-shadow-md">
                                    {product.name}
                                </h2>
                                <p className="text-white/90 text-sm line-clamp-2 drop-shadow-md">
                                    {product.description}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1">
                            {modifierGroups.map((group) => (
                                <div key={group.id} className="mb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-bold text-coffee-800">
                                            {group.name}
                                        </h3>
                                        {group.is_required && (
                                            <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded">
                                                Wajib
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {group.modifier_items.map((item) => {
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
                                                    className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
                                                        isSelected
                                                            ? "border-coffee-500 bg-coffee-50 ring-1 ring-coffee-500"
                                                            : "border-coffee-200 hover:border-coffee-300"
                                                    }`}
                                                >
                                                    <span
                                                        className={`font-medium ${
                                                            isSelected
                                                                ? "text-coffee-900"
                                                                : "text-coffee-600"
                                                        }`}
                                                    >
                                                        {item.name}
                                                    </span>
                                                    {parseFloat(item.price) >
                                                        0 && (
                                                        <span className="text-sm text-coffee-500">
                                                            +Rp{" "}
                                                            {parseFloat(
                                                                item.price
                                                            ).toLocaleString()}
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
                                <span className="font-bold text-coffee-900">
                                    Jumlah
                                </span>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() =>
                                            setQuantity(
                                                Math.max(1, quantity - 1)
                                            )
                                        }
                                        className="w-10 h-10 rounded-full bg-white border border-coffee-200 flex items-center justify-center text-coffee-600 hover:bg-coffee-100 disabled:opacity-50"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <span className="font-bold text-xl w-8 text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setQuantity(quantity + 1)
                                        }
                                        className="w-10 h-10 rounded-full bg-coffee-800 text-white flex items-center justify-center hover:bg-coffee-900"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-coffee-900 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-coffee-800 transition-colors flex justify-between px-6"
                            >
                                <span>Tambah ke Keranjang</span>
                                <span>
                                    Rp {calculateTotal().toLocaleString()}
                                </span>
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
    product: PropTypes.object,
};

export default ProductDetailDrawer;
