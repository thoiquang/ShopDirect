const API_URL = "https://localhost:7000/api";

const DataStore = {
    getProducts: async function() {
        try {
            const response = await fetch(`${API_URL}/products`);
            return await response.json();
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
            return [];
        }
    },

    getProductsByCategory: async function(categoryCode) {
        try {
            const response = await fetch(`${API_URL}/products/category/${categoryCode}`);
            return await response.json();
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
            return [];
        }
    },

    getCurrentUser: function() {
        // Lấy user từ localStorage hoặc return null
        return JSON.parse(localStorage.getItem('currentUser')) || null;
    },

    addToCart: function(productId) {
        console.log("Thêm sản phẩm vào giỏ:", productId);
        // TODO: Implement addToCart
    }
};