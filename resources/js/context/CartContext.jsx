import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem("scandine_cart");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("scandine_cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity = 1, modifiers = []) => {
        setCart((prev) => {
            // Create a unique key based on product ID AND selected modifiers
            // This allows the same product with different modifiers to be separate items
            const modifierKey = modifiers
                .map((m) => m.id)
                .sort()
                .join("-");
            const existingItemIndex = prev.findIndex(
                (item) =>
                    item.id === product.id &&
                    item.modifiers
                        .map((m) => m.id)
                        .sort()
                        .join("-") === modifierKey
            );

            if (existingItemIndex > -1) {
                const newCart = [...prev];
                newCart[existingItemIndex].quantity += quantity;
                return newCart;
            }

            return [
                ...prev,
                { ...product, quantity, modifiers, cartId: Date.now() },
            ];
        });
    };

    const removeFromCart = (cartId) => {
        setCart((prev) => prev.filter((item) => item.cartId !== cartId));
    };

    const updateQuantity = (cartId, delta) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if (item.cartId === cartId) {
                        return {
                            ...item,
                            quantity: Math.max(0, item.quantity + delta),
                        };
                    }
                    return item;
                })
                .filter((item) => item.quantity > 0)
        );
    };

    const clearCart = () => setCart([]);

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            const itemPrice = item.price;
            const modifiersPrice = item.modifiers.reduce(
                (sum, mod) => sum + mod.price,
                0
            );
            return total + (itemPrice + modifiersPrice) * item.quantity;
        }, 0);
    };

    const getCartCount = () =>
        cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                getCartCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
