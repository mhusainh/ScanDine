import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutService from "../services/CheckoutService";
import { useCart } from "../contexts/CartContext";

/**
 * Checkout Hook
 * Manages the logic for the checkout page.
 * @module hooks/useCheckout
 */
export const useCheckout = () => {
    const navigate = useNavigate();
    const { cart, clearCart, getCartTotal } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Prepare order payload from cart items
     * @param {object} formData
     * @param {string} tableUuid
     * @returns {object} payload
     */
    const preparePayload = useCallback(
        (formData, tableUuid) => ({
            table_uuid: tableUuid,
            customer_name: formData.customerName || "Guest",
            payment_method: formData.paymentMethod,
            notes: formData.notes,
            items: cart.map((item) => ({
                menu_item_id: item.id,
                quantity: item.quantity,
                price: item.price,
                notes: item.notes || null,
                modifiers: item.modifiers
                    ? item.modifiers.map((mod) => ({
                          modifier_item_id: mod.id,
                          price: mod.price,
                          quantity: 1,
                      }))
                    : [],
            })),
        }),
        [cart]
    );

    /**
     * Handle Snap Payment
     * @param {string} snapToken
     * @param {object} order
     */
    const handleSnapPayment = useCallback(
        (snapToken, order) => {
            // Redirect to Midtrans Snap Page
            window.location.href = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;
        },
        []
    );

    /**
     * Process checkout
     * @param {object} formData
     */
    const processCheckout = useCallback(
        async (formData) => {
            setIsProcessing(true);
            setError(null);
            try {
                const tableUuid = localStorage.getItem("table_uuid");
                if (!tableUuid) throw new Error("Table information missing.");

                const payload = preparePayload(formData, tableUuid);
                const response = await CheckoutService.checkout(payload);

                if (response.success) {
                    if (response.snap_token) {
                        handleSnapPayment(response.snap_token, response.order);
                    } else {
                        clearCart();
                        navigate("/success", {
                            state: { order: response.order },
                        });
                    }
                }
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        err.message ||
                        "Checkout failed"
                );
            } finally {
                setIsProcessing(false);
            }
        },
        [preparePayload, handleSnapPayment, clearCart, navigate]
    );

    return { cart, getCartTotal, processCheckout, isProcessing, error };
};
