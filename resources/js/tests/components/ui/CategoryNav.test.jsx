import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CategoryNav from "../../../components/ui/CategoryNav";

describe("CategoryNav Component", () => {
    const mockOnSelectCategory = vi.fn();
    const mockCategories = [
        { id: 1, name: "Makanan" },
        { id: 2, name: "Minuman" },
        { id: 3, name: "Snack" },
    ];

    it("should render categories correctly", () => {
        const { container } = render(
            <CategoryNav
                categories={mockCategories}
                activeCategory={1}
                onSelectCategory={mockOnSelectCategory}
            />
        );

        expect(screen.getByTestId("category-btn-1")).toHaveTextContent(
            "Makanan"
        );
        expect(screen.getByTestId("category-btn-2")).toHaveTextContent(
            "Minuman"
        );
        expect(screen.getByTestId("category-btn-3")).toHaveTextContent("Snack");

        expect(container).toMatchSnapshot();
    });

    it("should highlight active category", () => {
        render(
            <CategoryNav
                categories={mockCategories}
                activeCategory={2}
                onSelectCategory={mockOnSelectCategory}
            />
        );

        const activeBtn = screen.getByTestId("category-btn-2");
        const inactiveBtn = screen.getByTestId("category-btn-1");

        // Check for active class (bg-coffee-800)
        expect(activeBtn).toHaveClass("bg-coffee-800");
        expect(activeBtn).toHaveClass("text-white");

        // Check for inactive class
        expect(inactiveBtn).toHaveClass("bg-white");
        expect(inactiveBtn).toHaveClass("text-coffee-600");
    });

    it("should call onSelectCategory when a category is clicked", () => {
        render(
            <CategoryNav
                categories={mockCategories}
                activeCategory={1}
                onSelectCategory={mockOnSelectCategory}
            />
        );

        const categoryBtn = screen.getByTestId("category-btn-3");
        fireEvent.click(categoryBtn);

        expect(mockOnSelectCategory).toHaveBeenCalledWith(3);
    });
});
