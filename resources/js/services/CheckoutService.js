import axios from "../libs/axios";

/**
 * Service to handle checkout related API calls
 */
const CheckoutService = {
    /**
     * Submit a new order
     * @param {object} data - Order data
     * @returns {Promise}
     */
    async checkout(data) {
        try {
            const response = await axios.post("/api/v1/checkout", data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default CheckoutService;
