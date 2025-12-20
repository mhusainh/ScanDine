import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CheckoutPage from "../../../pages/user/Checkout";
import { useCheckout } from "../../../hooks/useCheckout";
import { MemoryRouter } from "react-router-dom";

// Mock hooks
vi.mock("../../../hooks/useCheckout");
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

describe("CheckoutPage", () => {
    const mockProcessCheckout = vi.fn();
    const mockGetCartTotal = vi.fn(() => 50000);

    const defaultCart = [
        {
            id: 1,
            name: "Nasi Goreng",
            price: 25000,
            quantity: 2,
            modifiers: [],
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        window.scrollTo = vi.fn();

        useCheckout.mockReturnValue({
            cart: defaultCart,
            getCartTotal: mockGetCartTotal,
            processCheckout: mockProcessCheckout,
            isProcessing: false,
            error: null,
        });
    });

    it("renders correctly with cart items", () => {
        render(
            <MemoryRouter>
                <CheckoutPage />
            </MemoryRouter>
        );

        expect(screen.getByText("Checkout")).toBeInTheDocument();
        expect(screen.getByText(/Nasi Goreng/)).toBeInTheDocument();
        // The total should be present (appears in summary and button)
        expect(screen.getAllByText(/Rp 50.000/).length).toBeGreaterThan(0);
    });

    it("validates customer name is required", async () => {
        render(
            <MemoryRouter>
                <CheckoutPage />
            </MemoryRouter>
        );

        const placeOrderBtn = screen.getByText(/Place Order/i);
        fireEvent.click(placeOrderBtn);

        const errorMessages = await screen.findAllByText(
            "Nama pelanggan wajib diisi"
        );
        expect(errorMessages.length).toBeGreaterThan(0);
        expect(mockProcessCheckout).not.toHaveBeenCalled();
        expect(window.scrollTo).toHaveBeenCalledWith({
            top: 0,
            behavior: "smooth",
        });
    });

    it("clears validation error when typing", async () => {
        render(
            <MemoryRouter>
                <CheckoutPage />
            </MemoryRouter>
        );

        const placeOrderBtn = screen.getByText(/Place Order/i);
        fireEvent.click(placeOrderBtn);

        expect(
            screen.getAllByText("Nama pelanggan wajib diisi").length
        ).toBeGreaterThan(0);

        const nameInput = screen.getByPlaceholderText("Nama Pemesan (Wajib)");
        fireEvent.change(nameInput, { target: { value: "John Doe" } });

        expect(
            screen.queryByText("Nama pelanggan wajib diisi")
        ).not.toBeInTheDocument();
    });

    it("submits order when name is provided", async () => {
        render(
            <MemoryRouter>
                <CheckoutPage />
            </MemoryRouter>
        );

        const nameInput = screen.getByPlaceholderText("Nama Pemesan (Wajib)");
        fireEvent.change(nameInput, { target: { value: "John Doe" } });

        const placeOrderBtn = screen.getByText(/Place Order/i);
        fireEvent.click(placeOrderBtn);

        expect(mockProcessCheckout).toHaveBeenCalledWith({
            customerName: "John Doe",
            paymentMethod: "cash",
            notes: "",
        });
    });
});
