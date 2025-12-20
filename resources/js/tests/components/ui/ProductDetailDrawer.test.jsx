import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProductDetailDrawer from "../../../components/ui/ProductDetailDrawer";
import * as CartContext from "../../../contexts/CartContext";

// Mock the CartContext
vi.mock("../../../contexts/CartContext", () => ({
    useCart: vi.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
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

describe("ProductDetailDrawer Component", () => {
    const mockOnClose = vi.fn();
    const mockAddToCart = vi.fn();

    const mockProduct = {
        id: 1,
        name: "Nasi Goreng Spesial",
        description: "Nasi goreng dengan telur dan ayam suwir",
        price: 25000,
        image: "nasigoreng.jpg",
        category_id: 1,
        modifier_groups: [
            {
                id: 1,
                name: "Level Pedas",
                type: "single_choice",
                is_required: true,
                modifier_items: [
                    { id: 101, name: "Tidak Pedas", price: "0.00" },
                    { id: 102, name: "Sedang", price: "0.00" },
                    { id: 103, name: "Pedas", price: "2000.00" },
                ],
            },
            {
                id: 2,
                name: "Topping Tambahan",
                type: "multiple_choice",
                is_required: false,
                modifier_items: [
                    { id: 201, name: "Keju", price: "5000.00" },
                    { id: 202, name: "Telur", price: "4000.00" },
                ],
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        CartContext.useCart.mockReturnValue({
            addToCart: mockAddToCart,
        });
        // Mock window.alert
        vi.spyOn(window, "alert").mockImplementation(() => {});
    });

    it("should not render when isOpen is false", () => {
        render(
            <ProductDetailDrawer
                isOpen={false}
                onClose={mockOnClose}
                product={mockProduct}
            />
        );
        expect(
            screen.queryByText("Nasi Goreng Spesial")
        ).not.toBeInTheDocument();
    });

    it("should not render when product is null", () => {
        render(
            <ProductDetailDrawer
                isOpen={true}
                onClose={mockOnClose}
                product={null}
            />
        );
        expect(
            screen.queryByText("Tambah ke Keranjang")
        ).not.toBeInTheDocument();
    });

    it("should render correctly when open with product", () => {
        const { container } = render(
            <ProductDetailDrawer
                isOpen={true}
                onClose={mockOnClose}
                product={mockProduct}
            />
        );

        expect(screen.getByText("Nasi Goreng Spesial")).toBeInTheDocument();
        expect(
            screen.getByText("Nasi Goreng dengan telur dan ayam suwir", {
                exact: false,
            })
        ).toBeInTheDocument();
        expect(screen.getByText("Level Pedas")).toBeInTheDocument();
        expect(screen.getByText("Topping Tambahan")).toBeInTheDocument();
        expect(screen.getByText("Tambah ke Keranjang")).toBeInTheDocument();

        // Check initial price (25000 * 1)
        expect(screen.getByText("Rp 25,000")).toBeInTheDocument();

        expect(container).toMatchSnapshot();
    });

    it("should call onClose when close button is clicked", () => {
        render(
            <ProductDetailDrawer
                isOpen={true}
                onClose={mockOnClose}
                product={mockProduct}
            />
        );

        // There might be multiple buttons, so we target the X icon's parent button
        // Or finding by class/role if accessible
        const closeButton = screen.getAllByRole("button")[0]; // Assuming the first button is close (X)
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
    });

    it("should update quantity and total price", () => {
        render(
            <ProductDetailDrawer
                isOpen={true}
                onClose={mockOnClose}
                product={mockProduct}
            />
        );

        const plusButton = screen.getAllByRole("button")[2]; // Assuming order: Close, Minus, Plus
        fireEvent.click(plusButton);

        expect(screen.getByText("2")).toBeInTheDocument();
        // Price should be 25000 * 2 = 50000
        expect(screen.getByText("Rp 50,000")).toBeInTheDocument();

        const minusButton = screen.getAllByRole("button")[1];
        fireEvent.click(minusButton);

        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("Rp 25,000")).toBeInTheDocument();
    });

    it("should handle single choice modifier selection (Level Pedas)", () => {
        render(
            <ProductDetailDrawer
                isOpen={true}
                onClose={mockOnClose}
                product={mockProduct}
            />
        );

        const pedasOption = screen.getByText("Pedas"); // +2000
        fireEvent.click(pedasOption);

        // Price: (25000 + 2000) * 1 = 27000
        expect(screen.getByText("Rp 27,000")).toBeInTheDocument();

        // Change to 'Sedang' (+0)
        const sedangOption = screen.getByText("Sedang");
        fireEvent.click(sedangOption);

        // Price: (25000 + 0) * 1 = 25000
        expect(screen.getByText("Rp 25,000")).toBeInTheDocument();
    });

    it("should handle multiple choice modifier selection (Topping)", () => {
        render(
            <ProductDetailDrawer
                isOpen={true}
                onClose={mockOnClose}
                product={mockProduct}
            />
        );

        const kejuOption = screen.getByText("Keju"); // +5000
        fireEvent.click(kejuOption);

        // Price: (25000 + 5000) * 1 = 30000
        expect(screen.getByText("Rp 30,000")).toBeInTheDocument();

        const telurOption = screen.getByText("Telur"); // +4000
        fireEvent.click(telurOption);

        // Price: (25000 + 5000 + 4000) * 1 = 34000
        expect(screen.getByText("Rp 34,000")).toBeInTheDocument();

        // Uncheck Keju
        fireEvent.click(kejuOption);

        // Price: (25000 + 4000) * 1 = 29000
        expect(screen.getByText("Rp 29,000")).toBeInTheDocument();
    });

    it("should validate required modifiers before adding to cart", () => {
        render(
            <ProductDetailDrawer
                isOpen={true}
                onClose={mockOnClose}
                product={mockProduct}
            />
        );

        const addToCartBtn = screen
            .getByText("Tambah ke Keranjang")
            .closest("button");
        fireEvent.click(addToCartBtn);

        expect(window.alert).toHaveBeenCalledWith("Mohon pilih Level Pedas");
        expect(mockAddToCart).not.toHaveBeenCalled();
    });

    it("should add to cart when validation passes", () => {
        render(
            <ProductDetailDrawer
                isOpen={true}
                onClose={mockOnClose}
                product={mockProduct}
            />
        );

        // Select required modifier (Level Pedas -> Tidak Pedas)
        fireEvent.click(screen.getByText("Tidak Pedas"));

        const addToCartBtn = screen
            .getByText("Tambah ke Keranjang")
            .closest("button");
        fireEvent.click(addToCartBtn);

        expect(mockAddToCart).toHaveBeenCalledWith(
            mockProduct,
            1,
            expect.arrayContaining([
                expect.objectContaining({ name: "Tidak Pedas" }),
            ])
        );
        expect(mockOnClose).toHaveBeenCalled();
    });
});
