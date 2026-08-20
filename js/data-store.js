const API_BASE_URL = "https://localhost:7283/api";

const DataStore = {
    getProducts: async function() {
        try {
            const res = await fetch(`${API_BASE_URL}/products`);
            return await res.json();
        } catch (e) {
            return [];
        }
    },

    getProductById: async function(id) {
        try {
            const res = await fetch(`${API_BASE_URL}/products/${id}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            return null;
        }
    },

    getProductsByCategory: async function(categoryCode) {
        try {
            const res = await fetch(`${API_BASE_URL}/products/category/${categoryCode}`);
            return await res.json();
        } catch (e) {
            return [];
        }
    },

    login: async function(email, password) {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Đăng nhập thất bại');
        }
        return await res.json();
    },

    register: async function(fullName, email, password) {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Đăng ký thất bại');
        }
        return await res.json();
    },

    createOrder: async function(orderPayload) {
        const res = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });
        return await res.json();
    },

    getOrders: async function() {
        try {
            const res = await fetch(`${API_BASE_URL}/orders`);
            return await res.json();
        } catch (e) {
            return [];
        }
    },

    getStats: async function() {
        try {
            const res = await fetch(`${API_BASE_URL}/orders/stats`);
            return await res.json();
        } catch (e) {
            return { revenue: 0, ordersCount: 0, productsCount: 0, usersCount: 0 };
        }
    },

    getCart: function() {
        return JSON.parse(localStorage.getItem("shop_cart")) || [];
    },

    saveCart: function(cart) {
        localStorage.setItem("shop_cart", JSON.stringify(cart));
    },

    addToCart: function(product) {
        const cart = this.getCart();
        const item = cart.find(i => i.productId === product.productId);
        if (item) {
            item.quantity += 1;
        } else {
            cart.push({
                productId: product.productId,
                productName: product.productName,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: 1
            });
        }
        this.saveCart(cart);
        alert(`Đã thêm "${product.productName}" vào giỏ hàng!`);
    },

    getCurrentUser: function() {
        return JSON.parse(localStorage.getItem("shop_current_user")) || null;
    },

    setCurrentUser: function(user) {
        if (user) {
            localStorage.setItem("shop_current_user", JSON.stringify(user));
        } else {
            localStorage.removeItem("shop_current_user");
        }
    }
};