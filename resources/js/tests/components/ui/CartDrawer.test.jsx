import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import CartDrawer from "../../../components/ui/CartDrawer";

// Mock framer-motion
vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, className, onClick, ...props }) => (
            <div className={className} onClick={onClick} {...props}>
                {children}
            </div>
        ),
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
    useNavigate: vi.fn(),
}));

describe("CartDrawer Component", () => {
    const mockOnClose = vi.fn();
    const mockUpdateQuantity = vi.fn();
    const mockNavigate = vi.fn();

    const mockCart = [
        {
            cartId: "c1",
            id: 1,
            name: "Kopi Susu",
            price: 15000,
            quantity: 2,
            modifiers: [],
        },
        {
            cartId: "c2",
            id: 2,
            name: "Mie Goreng",
            price: 20000,
            quantity: 1,
            modifiers: [
                { name: "Pedas", price: 2000 },
                { name: "Telur", price: 3000 },
            ],
        },
    ];

    const mockTotal = 55000;

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup mock navigate
        useNavigate.mockReturnValue(mockNavigate);
    });

    it("should not render when isOpen is false", () => {
        render(
            <CartDrawer
                isOpen={false}
                onClose={mockOnClose}
                cart={[]}
                updateQuantity={mockUpdateQuantity}
                total={0}
            />
        );
        expect(screen.queryByText("Your Order")).not.toBeInTheDocument();
    });

    it("should render empty state when cart is empty", () => {
        const { container } = render(
            <CartDrawer
                isOpen={true}
                onClose={mockOnClose}
                cart={[]}
                updateQuantity={mockUpdateQuantity}
                total={0}
            />
        );

        expect(screen.getByText("Your Order")).toBeInTheDocument();
        expect(screen.getByTestId("empty-cart-msg")).toBeInTheDocument();
        expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
        // Should not show checkout footer
        expect(screen.queryByTestId("checkout-btn")).not.toBeInTheDocument();
        expect(container).toMatchSnapshot();
    });

    it("should render cart items and footer correctly", () => {
        const { container } = render(
            <CartDrawer
                isOpen={true}
                onClose={mockOnClose}
                cart={mockCart}
                updateQuantity={mockUpdateQuantity}
                total={mockTotal}
            />
        );

        expect(screen.getByText("Kopi Susu")).toBeInTheDocument();

        // Quantity is now in a span between buttons
        expect(screen.getByTestId("qty-c1")).toHaveTextContent("2");
        expect(screen.getByTestId("qty-c2")).toHaveTextContent("1");

        expect(screen.getByText("Rp 15,000")).toBeInTheDocument();
        expect(screen.getByText("Rp 25,000")).toBeInTheDocument();

        expect(screen.getByText("+ Pedas")).toBeInTheDocument();
        expect(screen.getByText("+ Telur")).toBeInTheDocument();

        // Check Footer
        expect(screen.getByText("Total")).toBeInTheDocument();
        expect(screen.getByText("Rp 55,000")).toBeInTheDocument();
        expect(screen.getByTestId("checkout-btn")).toBeInTheDocument();

        expect(container).toMatchSnapshot();
    });

    it("should call onClose when close button is clicked", () => {
        render(
            <CartDrawer
                isOpen={true}
                onClose={mockOnClose}
                cart={mockCart}
                updateQuantity={mockUpdateQuantity}
                total={mockTotal}
            />
        );

        const closeButton = screen.getByTestId("close-cart-btn");
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
    });

    it("should call onClose when overlay is clicked", () => {
        const { container } = render(
            <CartDrawer
                isOpen={true}
                onClose={mockOnClose}
                cart={mockCart}
                updateQuantity={mockUpdateQuantity}
                total={mockTotal}
            />
        );

        const overlay = container.querySelector(".bg-black\\/50");
        fireEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalled();
    });

    it("should call updateQuantity when +/- buttons are clicked", () => {
        render(
            <CartDrawer
                isOpen={true}
                onClose={mockOnClose}
                cart={mockCart}
                updateQuantity={mockUpdateQuantity}
                total={mockTotal}
            />
        );

        // Minus for Kopi Susu (c1)
        fireEvent.click(screen.getByTestId("minus-btn-c1"));
        expect(mockUpdateQuantity).toHaveBeenCalledWith("c1", -1);

        // Plus for Kopi Susu (c1)
        fireEvent.click(screen.getByTestId("plus-btn-c1"));
        expect(mockUpdateQuantity).toHaveBeenCalledWith("c1", 1);
    });

    it("should disable minus button when quantity is 0 or less", () => {
        const cartWithZero = [
            {
                cartId: "c3",
                id: 3,
                name: "Zero Item",
                price: 10000,
                quantity: 0,
                modifiers: [],
            },
        ];

        render(
            <CartDrawer
                isOpen={true}
                onClose={mockOnClose}
                cart={cartWithZero}
                updateQuantity={mockUpdateQuantity}
                total={0}
            />
        );

        const minusBtn = screen.getByTestId("minus-btn-c3");
        expect(minusBtn).toBeDisabled();
    });

    it("should navigate to checkout on checkout button click", () => {
        render(
            <CartDrawer
                isOpen={true}
                onClose={mockOnClose}
                cart={mockCart}
                updateQuantity={mockUpdateQuantity}
                total={mockTotal}
            />
        );

        const checkoutBtn = screen.getByTestId("checkout-btn");
        fireEvent.click(checkoutBtn);
        expect(mockOnClose).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/checkout");
    });
});
