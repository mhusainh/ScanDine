import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSearchParams, useParams } from "react-router-dom"; // Import it here
import { useMenu } from "../../hooks/useMenu";
import MenuService from "../../services/MenuService";

// Mock dependencies
vi.mock("react-router-dom", () => ({
    useSearchParams: vi.fn(),
    useParams: vi.fn(),
}));

vi.mock("../../services/MenuService", () => ({
    default: {
        getMenu: vi.fn(),
    },
}));

describe("useMenu Hook", () => {
    const mockSearchParams = {
        get: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock for useSearchParams
        useSearchParams.mockReturnValue([mockSearchParams]);
        // Setup default mock for useParams
        useParams.mockReturnValue({});

        // Mock localStorage
        Object.defineProperty(window, "localStorage", {
            value: {
                getItem: vi.fn(),
                setItem: vi.fn(),
                clear: vi.fn(),
            },
            writable: true,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should initialize with loading state", async () => {
        mockSearchParams.get.mockReturnValue("table-123");
        // Return a promise that doesn't resolve immediately to check loading state
        MenuService.getMenu.mockReturnValue(new Promise(() => {}));

        const { result } = renderHook(() => useMenu());

        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe(null);
        expect(result.current.categories).toEqual([]);

        // Cleanup not needed as we mock the promise to never resolve in this specific test scope?
        // Actually, if we leave a pending promise, it might be fine, but better to resolve it to avoid open handles.
        // But for this test, checking immediate state is key.
    });

    it("should handle missing table UUID", async () => {
        mockSearchParams.get.mockReturnValue(null);
        window.localStorage.getItem.mockReturnValue(null);

        const { result } = renderHook(() => useMenu());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe(
            "Table not identified. Please scan QR code."
        );
        expect(MenuService.getMenu).not.toHaveBeenCalled();
    });

    it("should use table UUID from params and save to localStorage", async () => {
        const tableUuid = "uuid-from-params";
        mockSearchParams.get.mockReturnValue(null);
        useParams.mockReturnValue({ tableUuid });

        const mockData = {
            table: { id: 1, number: "5" },
            categories: [],
        };
        MenuService.getMenu.mockResolvedValue({
            success: true,
            data: mockData,
        });

        const { result } = renderHook(() => useMenu());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(window.localStorage.setItem).toHaveBeenCalledWith(
            "table_uuid",
            tableUuid
        );
        expect(MenuService.getMenu).toHaveBeenCalledWith(tableUuid);
    });

    it("should use table UUID from URL and save to localStorage", async () => {
        const tableUuid = "uuid-from-url";
        mockSearchParams.get.mockReturnValue(tableUuid);

        const mockData = {
            table: { id: 1, number: "5" },
            categories: [],
        };
        MenuService.getMenu.mockResolvedValue({
            success: true,
            data: mockData,
        });

        const { result } = renderHook(() => useMenu());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(window.localStorage.setItem).toHaveBeenCalledWith(
            "table_uuid",
            tableUuid
        );
        expect(MenuService.getMenu).toHaveBeenCalledWith(tableUuid);
    });

    it("should use table UUID from localStorage if not in URL", async () => {
        const tableUuid = "uuid-from-storage";
        mockSearchParams.get.mockReturnValue(null);
        window.localStorage.getItem.mockReturnValue(tableUuid);

        const mockData = {
            table: { id: 1, number: "5" },
            categories: [],
        };
        MenuService.getMenu.mockResolvedValue({
            success: true,
            data: mockData,
        });

        const { result } = renderHook(() => useMenu());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(MenuService.getMenu).toHaveBeenCalledWith(tableUuid);
    });

    it("should handle successful menu fetch", async () => {
        mockSearchParams.get.mockReturnValue("t1");

        const mockData = {
            table: { id: 1, number: "1" },
            categories: [
                {
                    id: 101,
                    name: "Makanan",
                    menu_items: [{ id: 1, name: "Nasi" }],
                },
                {
                    id: 102,
                    name: "Minuman",
                    menu_items: [{ id: 2, name: "Teh" }],
                },
            ],
        };
        MenuService.getMenu.mockResolvedValue({
            success: true,
            data: mockData,
        });

        const { result } = renderHook(() => useMenu());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.table).toEqual(mockData.table);
        expect(result.current.categories).toEqual(mockData.categories);
        // Should set first category as active by default
        expect(result.current.activeCategory).toBe(101);
        expect(result.current.products).toEqual(
            mockData.categories[0].menu_items
        );
    });

    it("should handle API error", async () => {
        mockSearchParams.get.mockReturnValue("t1");

        const errorMsg = "Network Error";
        MenuService.getMenu.mockRejectedValue({
            response: { data: { message: errorMsg } },
        });

        const { result } = renderHook(() => useMenu());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe(errorMsg);
    });

    it("should allow changing active category", async () => {
        mockSearchParams.get.mockReturnValue("t1");

        const mockData = {
            table: { id: 1 },
            categories: [
                { id: 101, name: "C1", menu_items: ["p1"] },
                { id: 102, name: "C2", menu_items: ["p2"] },
            ],
        };
        MenuService.getMenu.mockResolvedValue({
            success: true,
            data: mockData,
        });

        const { result } = renderHook(() => useMenu());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.activeCategory).toBe(101);

        act(() => {
            result.current.setActiveCategory(102);
        });

        expect(result.current.activeCategory).toBe(102);
        expect(result.current.products).toEqual(["p2"]);
    });
});
