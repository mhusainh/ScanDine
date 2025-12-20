import axios from "../libs/axios";

/**
 * Service to handle menu related API calls
 */
const MenuService = {
    /**
     * Get menu items for a specific table
     * @param {string} tableUuid
     * @param {object} params - Optional filters (category, search, etc)
     * @returns {Promise}
     */
    async getMenu(tableUuid, params = {}) {
        try {
            const response = await axios.get("/api/v1/menu", {
                params: {
                    table: tableUuid,
                    ...params,
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get details of a specific menu item
     * @param {number} id
     * @returns {Promise}
     */
    async getMenuItem(id) {
        try {
            const response = await axios.get(`/api/v1/menu/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default MenuService;
