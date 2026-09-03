const API_BASE_URL = "http://localhost:5025/api";

const fallbackProducts = [
    { productId: 1, productName: "Tai nghe Bluetooth Wireless", categoryId: 1, categoryCode: "dientu", categoryName: "Thiết bị điện tử", price: 590000, imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80", description: "Tai nghe không dây âm thanh chất lượng cao, chống ồn chủ động, thời lượng pin 24 giờ." },
    { productId: 2, productName: "Áo Thun Nam Cotton Cao Cấp", categoryId: 2, categoryCode: "thoitrang", categoryName: "Thời trang & Phụ kiện", price: 199000, imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80", description: "Thấm hút mồ hôi tốt, chất liệu 100% cotton co giãn 4 chiều, kiểu dáng thời trang." },
    { productId: 3, productName: "Nồi Chiên Không Dầu 5.5L", categoryId: 3, categoryCode: "giadung", categoryName: "Đồ gia dụng", price: 1250000, imageUrl: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&q=80", description: "Công nghệ chiên chân không giảm 85% mỡ thừa, dung tích 5.5L phù hợp gia đình." },
    { productId: 4, productName: "Đồng Hồ Thông Minh Sport", categoryId: 1, categoryCode: "dientu", categoryName: "Thiết bị điện tử", price: 890000, imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80", description: "Đo nhịp tim, giấc ngủ, đếm bước chân, kháng nước tiêu chuẩn IP68." },
    { productId: 5, productName: "Sách Lập Trình Web Hiện Đại", categoryId: 4, categoryCode: "sach", categoryName: "Sách & Văn phòng phẩm", price: 150000, imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80", description: "Kiến thức từ cơ bản đến nâng cao về HTML5, CSS3, JS, React và Node.js." },
    { productId: 6, productName: "Giày Thể Thao Sneaker Unisex", categoryId: 2, categoryCode: "thoitrang", categoryName: "Thời trang & Phụ kiện", price: 450000, imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80", description: "Đế cao su êm ái chống trượt, kiểu dáng unisex phong cách trẻ trung." }
];

const fallbackUsers = [
    { userId: 1, fullName: "Quản trị viên Admin", email: "admin@shopdirect.vn", role: "admin" },
    { userId: 2, fullName: "Khách Hàng Mẫu", email: "user@gmail.com", role: "user" }
];

function normalizeProduct(p) {
    return {
        productId: p.productId || p.id || 0,
        productName: p.productName || p.name || "Sản phẩm",
        categoryId: p.categoryId || 1,
        categoryCode: p.categoryCode || (p.categoryId === 1 ? 'dientu' : p.categoryId === 2 ? 'thoitrang' : p.categoryId === 3 ? 'giadung' : 'sach'),
        categoryName: p.categoryName || (p.categoryId === 1 ? 'Thiết bị điện tử' : p.categoryId === 2 ? 'Thời trang & Phụ kiện' : p.categoryId === 3 ? 'Đồ gia dụng' : 'Sách & Văn phòng phẩm'),
        price: p.price || 0,
        imageUrl: p.imageUrl || p.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
        description: p.description || ""
    };
}

const DataStore = {
    getProducts: async function() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);
            const res = await fetch(`${API_BASE_URL}/products`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) return data.map(normalizeProduct);
            }
        } catch (e) {}
        return fallbackProducts.map(normalizeProduct);
    },

    getProductById: async function(id) {
        const numId = parseInt(id);
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);
            const res = await fetch(`${API_BASE_URL}/products/${numId}`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                return normalizeProduct(data);
            }
        } catch (e) {}
        const found = fallbackProducts.find(p => p.productId === numId);
        return found ? normalizeProduct(found) : null;
    },

    getProductsByCategory: async function(categoryCode) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);
            const res = await fetch(`${API_BASE_URL}/products/category/${categoryCode}`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) return data.map(normalizeProduct);
            }
        } catch (e) {}
        return fallbackProducts.filter(p => p.categoryCode === categoryCode).map(normalizeProduct);
    },

    login: async function(email, password) {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (res.ok) return await res.json();
            const err = await res.json();
            throw new Error(err.message || 'Đăng nhập thất bại');
        } catch (e) {
            if (email === 'admin@shopdirect.vn' && password === '123456') {
                return { userId: 1, fullName: "Quản trị viên Admin", email: email, role: "admin" };
            } else if (email === 'user@gmail.com' && password === '123456') {
                return { userId: 2, fullName: "Khách Hàng Mẫu", email: email, role: "user" };
            }
            throw new Error("Email hoặc mật khẩu không chính xác!");
        }
    },

    register: async function(fullName, email, password) {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password })
            });
            const data = await res.json();
            if (res.ok) return data;
            throw new Error(data.message || "Đăng ký thất bại.");
        } catch (e) {
            if (e instanceof TypeError) {
                throw new Error("Không thể kết nối đến máy chủ.");
            }
            throw e;
        }
    },

    createOrder: async function(orderPayload) {
        try {
            const res = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
            });
            if (res.ok) return await res.json();
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || "Không thể tạo đơn hàng.");
        } catch (e) {
            if (!(e instanceof TypeError)) throw e;
        }

        const localOrders = JSON.parse(localStorage.getItem("shop_orders")) || [];
        const newOrder = {
            orderId: Date.now(),
            orderCode: "HD" + Date.now().toString().slice(-6),
            customerName: orderPayload.customerName,
            customerPhone: orderPayload.customerPhone,
            customerAddress: orderPayload.customerAddress,
            totalAmount: orderPayload.totalAmount,
            paymentMethod: orderPayload.paymentMethod,
            status: "Chờ xử lý",
            createdAt: new Date().toISOString()
        };
        localOrders.push(newOrder);
        localStorage.setItem("shop_orders", JSON.stringify(localOrders));
        return newOrder;
    },

    getOrders: async function() {
        try {
            const res = await fetch(`${API_BASE_URL}/orders`, { headers: this.getAuthHeaders() });
            if (res.ok) return await res.json();
        } catch (e) {}
        return JSON.parse(localStorage.getItem("shop_orders")) || [];
    },

    getStats: async function() {
        try {
            const res = await fetch(`${API_BASE_URL}/orders/stats`, { headers: this.getAuthHeaders() });
            if (res.ok) return await res.json();
        } catch (e) {}
        const orders = JSON.parse(localStorage.getItem("shop_orders")) || [];
        const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        return {
            revenue: revenue,
            ordersCount: orders.length,
            productsCount: fallbackProducts.length,
            usersCount: fallbackUsers.length
        };
    },

    getUsers: async function() {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/users`, { headers: this.getAuthHeaders() });
            if (res.ok) return await res.json();
        } catch (e) {}
        return fallbackUsers;
    },

    getAuthHeaders: function() {
        const user = this.getCurrentUser();
        return user && user.token ? { Authorization: `Bearer ${user.token}` } : {};
    },

    getCart: function() {
        return JSON.parse(localStorage.getItem("shop_cart")) || [];
    },

    saveCart: function(cart) {
        localStorage.setItem("shop_cart", JSON.stringify(cart));
    },

    addToCart: function(product) {
        const cart = this.getCart();
        const p = normalizeProduct(product);
        const item = cart.find(i => i.productId === p.productId);
        if (item) {
            item.quantity += 1;
        } else {
            cart.push({
                productId: p.productId,
                productName: p.productName,
                price: p.price,
                imageUrl: p.imageUrl,
                quantity: 1
            });
        }
        this.saveCart(cart);
        alert(`Đã thêm "${p.productName}" vào giỏ hàng!`);
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