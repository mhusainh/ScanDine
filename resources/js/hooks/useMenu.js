import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import MenuService from "../services/MenuService";

/**
 * Menu Hook
 * Manages the logic for the menu page: fetching data, handling state, filtering.
 * @module hooks/useMenu
 * @returns {object} Menu state and handlers
 */
export const useMenu = () => {
    const [searchParams] = useSearchParams();
    const { tableUuid: paramUuid } = useParams();

    // Prioritize path param, fallback to query param
    const tableUuid = paramUuid || searchParams.get("table");

    const [state, setState] = useState({
        table: null,
        categories: [],
        activeCategory: null,
        loading: true,
        error: null,
    });

    /**
     * Get and persist Table UUID
     * @returns {string|null} Table UUID
     */
    const getTableUuid = useCallback(() => {
        if (tableUuid) {
            localStorage.setItem("table_uuid", tableUuid);
            return tableUuid;
        }
        return localStorage.getItem("table_uuid");
    }, [tableUuid]);

    /**
     * Handle successful menu fetch
     * @param {object} data - API response data
     */
    const handleSuccess = useCallback((data) => {
        setState({
            table: data.table,
            categories: data.categories,
            activeCategory:
                data.categories.length > 0 ? data.categories[0].id : null,
            loading: false,
            error: null,
        });
    }, []);

    /**
     * Handle fetch error
     * @param {object} err - Error object
     */
    const handleError = useCallback((err) => {
        setState((prev) => ({
            ...prev,
            loading: false,
            error: err.response?.data?.message || "Gagal memuat menu.",
        }));
    }, []);

    /**
     * Fetch menu data from API
     */
    const fetchMenu = useCallback(async () => {
        const currentUuid = getTableUuid();
        if (!currentUuid) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: "Table not identified. Please scan QR code.",
            }));
            return;
        }

        try {
            setState((prev) => ({ ...prev, loading: true }));
            const response = await MenuService.getMenu(currentUuid);
            if (response.success) handleSuccess(response.data);
        } catch (err) {
            handleError(err);
        }
    }, [getTableUuid, handleSuccess, handleError]);

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    const getActiveProducts = useCallback(() => {
        if (!state.activeCategory || !state.categories.length) return [];
        const category = state.categories.find(
            (c) => c.id === state.activeCategory
        );
        return category ? category.menu_items : [];
    }, [state.activeCategory, state.categories]);

    return {
        ...state,
        setActiveCategory: (id) =>
            setState((prev) => ({ ...prev, activeCategory: id })),
        products: getActiveProducts(),
    };
};
