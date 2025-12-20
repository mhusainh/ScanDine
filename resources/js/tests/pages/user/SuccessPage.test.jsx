import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SuccessPage from "../../../pages/user/Success";

// Mock dependencies
const mockNavigate = vi.fn();

// Mock react-router-dom hooks
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe("SuccessPage Component", () => {
    const mockOrder = {
        order_number: "ORD-12345",
        total_amount: "50000.00",
        table: {
            table_number: "Meja 5",
            name: "Meja 5",
        },
    };

    beforeEach(() => {
        mockNavigate.mockClear();
    });

    it("renders order details correctly when order data is present", () => {
        render(
            <MemoryRouter
                initialEntries={[
                    { pathname: "/success", state: { order: mockOrder } },
                ]}
            >
                <Routes>
                    <Route path="/success" element={<SuccessPage />} />
                </Routes>
            </MemoryRouter>
        );

        // Check static text
        expect(screen.getByText("Order Confirmed!")).toBeInTheDocument();

        // Check dynamic order details
        expect(screen.getByText("ORD-12345")).toBeInTheDocument();
        expect(screen.getByText("Meja 5")).toBeInTheDocument();

        // Check formatted price (Rp 50.000)
        // Note: toLocaleString behavior might vary by locale, checking for parts
        expect(screen.getByText(/Rp/)).toBeInTheDocument();
        expect(screen.getByText(/50.000/)).toBeInTheDocument();
    });

    it("renders fallback values when order data is missing", () => {
        render(
            <MemoryRouter
                initialEntries={[{ pathname: "/success", state: {} }]}
            >
                <Routes>
                    <Route path="/success" element={<SuccessPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Order Confirmed!")).toBeInTheDocument();

        // Check for fallback dashes
        const dashes = screen.getAllByText("-");
        expect(dashes.length).toBeGreaterThanOrEqual(2); // Order ID and Table
    });

    it("navigates back to menu when button is clicked", () => {
        render(
            <MemoryRouter initialEntries={["/success"]}>
                <Routes>
                    <Route path="/success" element={<SuccessPage />} />
                </Routes>
            </MemoryRouter>
        );

        const button = screen.getByText("Back to Menu");
        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith("/menu");
    });
});
