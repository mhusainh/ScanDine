import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "../../contexts/CartContext";

describe("CartContext Price Calculation", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("should correctly calculate total with string prices", () => {
        const wrapper = ({ children }) => (
            <CartProvider>{children}</CartProvider>
        );
        const { result } = renderHook(() => useCart(), { wrapper });

        const product = {
            id: 1,
            name: "Nasi Goreng",
            price: "25000.00", // String price
        };

        const modifiers = [
            { id: 101, name: "Telur", price: "3000.00" }, // String price
            { id: 102, name: "Pedas", price: 2000 }, // Number price
        ];

        act(() => {
            result.current.addToCart(product, 2, modifiers);
        });

        // Calculation: (25000 + 3000 + 2000) * 2 = 60000
        expect(result.current.getCartTotal()).toBe(60000);
    });

    it("should correctly calculate total with number prices", () => {
        const wrapper = ({ children }) => (
            <CartProvider>{children}</CartProvider>
        );
        const { result } = renderHook(() => useCart(), { wrapper });

        const product = {
            id: 2,
            name: "Mie Goreng",
            price: 20000,
        };

        const modifiers = [{ id: 101, name: "Telur", price: 3000 }];

        act(() => {
            result.current.addToCart(product, 1, modifiers);
        });

        // Calculation: (20000 + 3000) * 1 = 23000
        expect(result.current.getCartTotal()).toBe(23000);
    });
});
