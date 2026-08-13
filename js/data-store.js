const API_URL = "https://localhost:7283/api"; 

const DataStore = {
    // Gọi API C# lấy danh sách từ SQL Server
    getProducts: async function() {
        try {
            const response = await fetch(`${API_URL}/products`);
            if (!response.ok) throw new Error("Lỗi mạng khi tải dữ liệu");
            return await response.json();
        } catch (error) {
            console.error("Lỗi kết nối API Backend:", error);
            return [];
        }
    },

    getProductById: async function(id) {
        try {
            const response = await fetch(`${API_URL}/products/${id}`);
            if (!response.ok) throw new Error("Không tìm thấy sản phẩm");
            return await response.json();
        } catch (error) {
            console.error("Lỗi:", error);
            return null;
        }
    },

    // Quản lý giỏ hàng tạm thời trên trình duyệt
    getCart: function() {
        return JSON.parse(localStorage.getItem("shop_cart")) || [];
    },
    saveCart: function(cart) {
        localStorage.setItem("shop_cart", JSON.stringify(cart));
    },
    getCurrentUser: function() {
        return JSON.parse(localStorage.getItem("shop_current_user")) || null;
    }
};