import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCheckout } from '../../hooks/useCheckout';
import CheckoutService from '../../services/CheckoutService';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

vi.mock('../../contexts/CartContext', () => ({
    useCart: vi.fn(),
}));

vi.mock('../../services/CheckoutService', () => ({
    default: {
        checkout: vi.fn(),
    },
}));

describe('useCheckout Hook', () => {
    const mockNavigate = vi.fn();
    const mockClearCart = vi.fn();
    const mockGetCartTotal = vi.fn();
    
    const mockCart = [
        {
            id: 1,
            name: 'Item 1',
            quantity: 2,
            price: 10000,
            modifiers: [
                { id: 10, price: 2000 }
            ]
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        
        useNavigate.mockReturnValue(mockNavigate);
        
        useCart.mockReturnValue({
            cart: mockCart,
            clearCart: mockClearCart,
            getCartTotal: mockGetCartTotal,
        });

        // Mock localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: vi.fn(),
                setItem: vi.fn(),
            },
            writable: true
        });

        // Mock window.snap
        window.snap = {
            pay: vi.fn(),
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete window.snap;
    });

    it('should initialize correctly', () => {
        const { result } = renderHook(() => useCheckout());
        
        expect(result.current.cart).toEqual(mockCart);
        expect(result.current.isProcessing).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should handle missing table UUID', async () => {
        window.localStorage.getItem.mockReturnValue(null);
        
        const { result } = renderHook(() => useCheckout());

        await act(async () => {
            await result.current.processCheckout({});
        });

        expect(result.current.error).toBe('Table information missing.');
        expect(CheckoutService.checkout).not.toHaveBeenCalled();
    });

    it('should process checkout successfully without Snap (e.g. Cash)', async () => {
        window.localStorage.getItem.mockReturnValue('table-123');
        
        const mockResponse = {
            success: true,
            order: { id: 123, status: 'pending' },
            snap_token: null
        };
        CheckoutService.checkout.mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useCheckout());

        await act(async () => {
            await result.current.processCheckout({
                customerName: 'John',
                paymentMethod: 'cash',
                notes: 'Test'
            });
        });

        expect(CheckoutService.checkout).toHaveBeenCalledWith(expect.objectContaining({
            table_uuid: 'table-123',
            customer_name: 'John',
            items: expect.arrayContaining([
                expect.objectContaining({
                    menu_item_id: 1,
                    quantity: 2,
                    modifiers: expect.arrayContaining([
                        expect.objectContaining({ modifier_item_id: 10 })
                    ])
                })
            ])
        }));

        expect(mockClearCart).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/success', { state: { order: mockResponse.order } });
        expect(result.current.isProcessing).toBe(false);
    });

    it('should handle Snap payment flow', async () => {
        window.localStorage.getItem.mockReturnValue('table-123');
        
        const mockResponse = {
            success: true,
            order: { id: 123 },
            snap_token: 'token-123'
        };
        CheckoutService.checkout.mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useCheckout());

        await act(async () => {
            await result.current.processCheckout({
                customerName: 'John',
                paymentMethod: 'qris'
            });
        });

        expect(window.snap.pay).toHaveBeenCalledWith('token-123', expect.objectContaining({
            onSuccess: expect.any(Function),
            onPending: expect.any(Function),
            onError: expect.any(Function),
            onClose: expect.any(Function)
        }));
        
        // Simulate Snap success
        const snapCalls = window.snap.pay.mock.calls[0];
        const snapOptions = snapCalls[1];
        
        act(() => {
            snapOptions.onSuccess();
        });
        
        expect(mockClearCart).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/success', { state: { order: mockResponse.order } });
    });

    it('should handle Snap payment error', async () => {
        window.localStorage.getItem.mockReturnValue('table-123');
        CheckoutService.checkout.mockResolvedValue({
            success: true,
            order: { id: 123 },
            snap_token: 'token-123'
        });

        const { result } = renderHook(() => useCheckout());

        await act(async () => {
            await result.current.processCheckout({});
        });

        // Simulate Snap error
        const snapCalls = window.snap.pay.mock.calls[0];
        const snapOptions = snapCalls[1];
        
        act(() => {
            snapOptions.onError();
        });
        
        expect(result.current.error).toBe('Payment failed!');
        expect(mockClearCart).not.toHaveBeenCalled();
    });

    it('should handle checkout API error', async () => {
        window.localStorage.getItem.mockReturnValue('table-123');
        const errorMsg = 'Backend Error';
        CheckoutService.checkout.mockRejectedValue({ response: { data: { message: errorMsg } } });

        const { result } = renderHook(() => useCheckout());

        await act(async () => {
            await result.current.processCheckout({});
        });

        expect(result.current.error).toBe(errorMsg);
        expect(result.current.isProcessing).toBe(false);
    });
});
