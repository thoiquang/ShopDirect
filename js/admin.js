let allProducts = [];
let allOrders = [];

document.addEventListener("DOMContentLoaded", async () => {
    const user = DataStore.getCurrentUser();
    if (!user || user.role !== 'admin') {
        alert("Bạn cần đăng nhập bằng tài khoản Quản trị viên (Admin) để truy cập!");
        window.location.href = "login.html";
        return;
    }

    await loadOverviewStats();
    await loadProductsTable();
    await loadOrdersTable();
    await loadUsersTable();
    await loadCardUsers();
});

// Chuyển Tab
function switchAdminTab(tab) {
    const tabs = ['overview', 'products', 'orders', 'users', 'cards'];
    tabs.forEach(t => {
        const sec = document.getElementById(`sec_${t}`);
        const btn = document.getElementById(`tabBtn_${t}`);
        if (t === tab) {
            sec.classList.remove("hidden");
            btn.className = "px-4 py-2 rounded-lg font-bold text-sm bg-indigo-600 text-white shadow transition flex items-center gap-2";
        } else {
            sec.classList.add("hidden");
            btn.className = "px-4 py-2 rounded-lg font-semibold text-sm bg-white text-gray-600 hover:bg-gray-50 border transition flex items-center gap-2";
        }
    });
}

// 1. Tổng quan
async function loadOverviewStats() {
    const stats = await DataStore.getStats();

    const revElem = document.getElementById("admRevenue");
    const ordElem = document.getElementById("admOrdersCount");
    const prodElem = document.getElementById("admProductsCount");
    const userElem = document.getElementById("admUsersCount");

    if (revElem) revElem.innerText = `${Number(stats.revenue || 0).toLocaleString('vi-VN')} đ`;
    if (ordElem) ordElem.innerText = stats.ordersCount || 0;
    if (prodElem) prodElem.innerText = stats.productsCount || 0;
    if (userElem) userElem.innerText = stats.usersCount || 0;
}

// 2. Quản lý Sản phẩm & Bộ lọc
async function loadProductsTable() {
    allProducts = await DataStore.getProducts();
    renderProducts(allProducts);
}

function renderProducts(items) {
    const table = document.getElementById("productsTableBody");
    table.innerHTML = "";

    if (!items || items.length === 0) {
        table.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-gray-400">Không tìm thấy sản phẩm phù hợp</td></tr>`;
        return;
    }

    items.forEach(p => {
        const tr = document.createElement("tr");
        tr.className = "border-b hover:bg-gray-50";
        tr.innerHTML = `
            <td class="py-2.5 px-4">
                <img src="${p.imageUrl}" class="w-12 h-12 object-cover rounded-lg border shadow-sm">
            </td>
            <td class="py-2.5 px-4 font-semibold text-gray-800">${p.productName}</td>
            <td class="py-2.5 px-4 text-xs font-bold text-indigo-600 uppercase">${p.categoryName || 'Sản phẩm'}</td>
            <td class="py-2.5 px-4 font-bold text-gray-800">${Number(p.price).toLocaleString('vi-VN')} đ</td>
            <td class="py-2.5 px-4 text-center space-x-2">
                <button onclick="openProductModal('edit', ${p.productId})" class="text-blue-600 hover:text-blue-800 font-semibold text-xs px-2.5 py-1 bg-blue-50 rounded border border-blue-200">
                    <i class="fa-solid fa-pen-to-square"></i> Sửa
                </button>
                <button onclick="deleteProductHandler(${p.productId})" class="text-red-600 hover:text-red-800 font-semibold text-xs px-2.5 py-1 bg-red-50 rounded border border-red-200">
                    <i class="fa-solid fa-trash"></i> Xóa
                </button>
            </td>
        `;
        table.appendChild(tr);
    });
}

function filterProductsList() {
    const searchVal = document.getElementById("searchProductInput").value.toLowerCase().trim();
    const catVal = document.getElementById("filterProductCategory").value;

    const filtered = allProducts.filter(p => {
        const matchName = p.productName.toLowerCase().includes(searchVal);
        const matchCat = (catVal === 'all') || (p.categoryId.toString() === catVal);
        return matchName && matchCat;
    });

    renderProducts(filtered);
}

function openProductModal(mode, productId = null) {
    const modal = document.getElementById("productModal");
    const title = document.getElementById("productModalTitle");
    const editIdInput = document.getElementById("editProdId");

    if (mode === 'edit' && productId) {
        title.innerText = "Chỉnh Sửa Sản Phẩm";
        const prod = allProducts.find(p => p.productId === productId);
        if (prod) {
            editIdInput.value = prod.productId;
            document.getElementById("modalProdName").value = prod.productName;
            document.getElementById("modalProdCategory").value = prod.categoryId || 1;
            document.getElementById("modalProdPrice").value = prod.price;
            document.getElementById("modalProdImage").value = prod.imageUrl;
            document.getElementById("modalProdDesc").value = prod.description || "";
        }
    } else {
        title.innerText = "Thêm Sản Phẩm Mới";
        editIdInput.value = "";
        document.getElementById("modalProdName").value = "";
        document.getElementById("modalProdCategory").value = "1";
        document.getElementById("modalProdPrice").value = "";
        document.getElementById("modalProdImage").value = "";
        document.getElementById("modalProdDesc").value = "";
    }
    modal.classList.remove("hidden");
}

function closeProductModal() {
    document.getElementById("productModal").classList.add("hidden");
}

async function handleSaveProduct(e) {
    e.preventDefault();
    const editId = document.getElementById("editProdId").value;
    const name = document.getElementById("modalProdName").value.trim();
    const catId = parseInt(document.getElementById("modalProdCategory").value);
    const price = parseFloat(document.getElementById("modalProdPrice").value);
    const image = document.getElementById("modalProdImage").value.trim();
    const desc = document.getElementById("modalProdDesc").value.trim();

    const productPayload = {
        productId: editId ? parseInt(editId) : 0,
        productName: name,
        categoryId: catId,
        price: price,
        imageUrl: image,
        description: desc
    };

    try {
        if (editId) {
            await fetch(`${API_BASE_URL}/products/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...DataStore.getAuthHeaders() },
                body: JSON.stringify(productPayload)
            });
            alert("Cập nhật sản phẩm thành công!");
        } else {
            await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...DataStore.getAuthHeaders() },
                body: JSON.stringify(productPayload)
            });
            alert("Thêm sản phẩm thành công!");
        }
    } catch (err) {}

    closeProductModal();
    await loadProductsTable();
    await loadOverviewStats();
}

async function deleteProductHandler(id) {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
        try {
            await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE', headers: DataStore.getAuthHeaders() });
        } catch (e) {}
        await loadProductsTable();
        await loadOverviewStats();
        alert("Đã xóa sản phẩm!");
    }
}

// 3. Quản lý Đơn hàng & Xem chi tiết
async function loadOrdersTable() {
    allOrders = await DataStore.getOrders();
    renderOrders(allOrders);
    const recentTable = document.getElementById("recentOrdersTable");
    if (!recentTable) return;

    recentTable.innerHTML = "";
    if (!allOrders || allOrders.length === 0) {
        recentTable.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-gray-400 font-medium">Chưa có đơn hàng nào trong hệ thống</td></tr>`;
        return;
    }

    [...allOrders].slice(0, 5).forEach(o => {
        const tr = document.createElement("tr");
        tr.className = "border-b hover:bg-gray-50";
        tr.innerHTML = `
            <td class="py-3 px-4 font-bold text-indigo-600">${o.orderCode || o.orderId}</td>
            <td class="py-3 px-4">
                <p class="font-semibold text-gray-800">${o.customerName}</p>
                <p class="text-xs text-gray-500">${o.customerPhone}</p>
            </td>
            <td class="py-3 px-4 text-xs"><span class="bg-gray-100 px-2 py-0.5 rounded border">${o.paymentMethod}</span></td>
            <td class="py-3 px-4 font-bold text-indigo-600">${Number(o.totalAmount).toLocaleString('vi-VN')} đ</td>
            <td class="py-3 px-4 text-xs text-gray-500">${new Date(o.createdAt).toLocaleString('vi-VN')}</td>
        `;
        recentTable.appendChild(tr);
    });
}

function renderOrders(items) {
    const table = document.getElementById("ordersTableBody");
    if (!table) return;
    table.innerHTML = "";

    if (!items || items.length === 0) {
        table.innerHTML = `<tr><td colspan="8" class="py-6 text-center text-gray-400 font-medium">Không tìm thấy đơn hàng nào</td></tr>`;
        return;
    }

    [...items].reverse().forEach(o => {
        const currentStatus = o.orderStatus || o.status || 'Chờ xử lý';
        const tr = document.createElement("tr");
        tr.className = "border-b hover:bg-gray-50";
        tr.innerHTML = `
            <td class="py-3 px-4 font-bold text-indigo-600">${o.orderCode || o.orderId}</td>
            <td class="py-3 px-4">
                <p class="font-semibold text-gray-800">${o.customerName}</p>
                <p class="text-xs text-gray-500">${o.customerPhone}</p>
            </td>
            <td class="py-3 px-4 text-xs max-w-xs truncate">${o.customerAddress}</td>
            <td class="py-3 px-4 text-xs">${o.paymentMethod}</td>
            <td class="py-3 px-4 font-bold text-indigo-600">${Number(o.totalAmount).toLocaleString('vi-VN')} đ</td>
            <td class="py-3 px-4">
                <select onchange="changeOrderStatusHandler('${o.orderId}', this.value)" class="text-xs font-semibold px-2 py-1 rounded border outline-none ${
                    currentStatus === 'Hoàn tất' ? 'bg-green-50 text-green-700 border-green-300' :
                    currentStatus === 'Đang giao hàng' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                    currentStatus === 'Đã hủy' ? 'bg-red-50 text-red-700 border-red-300' :
                    'bg-yellow-50 text-yellow-700 border-yellow-300'
                }">
                    <option value="Chờ xử lý" ${currentStatus === 'Chờ xử lý' ? 'selected' : ''}>Chờ xử lý</option>
                    <option value="Đang giao hàng" ${currentStatus === 'Đang giao hàng' ? 'selected' : ''}>Đang giao hàng</option>
                    <option value="Hoàn tất" ${currentStatus === 'Hoàn tất' ? 'selected' : ''}>Hoàn tất</option>
                    <option value="Đã hủy" ${currentStatus === 'Đã hủy' ? 'selected' : ''}>Đã hủy</option>
                </select>
            </td>
            <td class="py-3 px-4 text-center">
                <button onclick="viewOrderDetailModal('${o.orderId}')" class="text-indigo-600 hover:text-indigo-800 text-xs font-bold px-2.5 py-1 bg-indigo-50 rounded border border-indigo-200">
                    <i class="fa-solid fa-eye"></i> Xem
                </button>
            </td>
            <td class="py-3 px-4 text-center">
                <button onclick="deleteOrderHandler('${o.orderId}')" class="text-red-500 hover:text-red-700 font-medium text-xs p-1">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        table.appendChild(tr);
    });
}

function filterOrdersList() {
    const searchVal = document.getElementById("searchOrderInput").value.toLowerCase().trim();
    const statusVal = document.getElementById("filterOrderStatus").value;

    const filtered = allOrders.filter(o => {
        const matchText = (o.orderCode || '').toLowerCase().includes(searchVal) ||
                          (o.customerName || '').toLowerCase().includes(searchVal) ||
                          (o.customerPhone || '').includes(searchVal);
        const currentStatus = o.orderStatus || o.status || 'Chờ xử lý';
        const matchStatus = (statusVal === 'all') || (currentStatus === statusVal);
        return matchText && matchStatus;
    });

    renderOrders(filtered);
}

function viewOrderDetailModal(orderId) {
    const ord = allOrders.find(o => o.orderId == orderId || o.orderCode == orderId);
    if (!ord) return;

    document.getElementById("viewOrderCode").innerText = `Mã đơn hàng: ${ord.orderCode || ord.orderId}`;
    document.getElementById("viewCustName").innerText = ord.customerName;
    document.getElementById("viewCustPhone").innerText = ord.customerPhone;
    document.getElementById("viewCustAddress").innerText = ord.customerAddress;
    document.getElementById("viewPayment").innerText = ord.paymentMethod;
    document.getElementById("viewOrderDate").innerText = new Date(ord.createdAt).toLocaleString('vi-VN');
    document.getElementById("viewTotalAmount").innerText = `${Number(ord.totalAmount).toLocaleString('vi-VN')} đ`;

    document.getElementById("orderDetailModal").classList.remove("hidden");
}

function closeOrderDetailModal() {
    document.getElementById("orderDetailModal").classList.add("hidden");
}

async function changeOrderStatusHandler(orderId, newStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...DataStore.getAuthHeaders() },
            body: JSON.stringify({ status: newStatus })
        });
        if (!response.ok) throw new Error("Không thể cập nhật trạng thái đơn hàng.");
        alert("Cập nhật trạng thái thành công!");
    } catch (e) {
        alert(e.message || "Không thể cập nhật trạng thái đơn hàng.");
        return;
    }

    let orders = JSON.parse(localStorage.getItem("shop_orders")) || [];
    const ord = orders.find(o => o.orderId == orderId || o.orderCode == orderId);
    if (ord) {
        ord.orderStatus = newStatus;
        localStorage.setItem("shop_orders", JSON.stringify(orders));
    }

    await loadOrdersTable();
    await loadOverviewStats();
}

async function deleteOrderHandler(orderId) {
    if (confirm(`Bạn có chắc muốn xóa đơn hàng này?`)) {
        try {
            await fetch(`${API_BASE_URL}/orders/${orderId}`, { method: 'DELETE', headers: DataStore.getAuthHeaders() });
        } catch (e) {}

        let orders = JSON.parse(localStorage.getItem("shop_orders")) || [];
        orders = orders.filter(o => o.orderId != orderId && o.orderCode != orderId);
        localStorage.setItem("shop_orders", JSON.stringify(orders));
        await loadOrdersTable();
        await loadOverviewStats();
    }
}

// 4. Quản lý Tài khoản Người dùng
async function loadUsersTable() {
    const users = await DataStore.getUsers();
    const table = document.getElementById("usersTableBody");
    table.innerHTML = "";

    users.forEach(u => {
        const tr = document.createElement("tr");
        tr.className = "border-b hover:bg-gray-50";
        tr.innerHTML = `
            <td class="py-3 px-4 font-bold text-gray-500">#${u.userId || 1}</td>
            <td class="py-3 px-4 font-semibold text-gray-800">${u.fullName || u.name}</td>
            <td class="py-3 px-4 text-gray-600">${u.email}</td>
            <td class="py-3 px-4">
                <span class="${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'} text-xs px-2.5 py-1 rounded-full font-bold uppercase">
                    ${u.role}
                </span>
            </td>
        `;
        table.appendChild(tr);
    });
}

async function loadCardUsers() {
    const select = document.getElementById("pageCardUserId");
    if (!select) return;
    const users = await DataStore.getUsers();
    select.innerHTML = '<option value="">Chọn tài khoản khách hàng</option>' + users.filter(user => user.role !== "admin").map(user => `<option value="${user.userId}" data-name="${user.fullName || user.name || ''}">${user.fullName || user.name} - ${user.email}</option>`).join("");
    select.onchange = () => {
        const option = select.options[select.selectedIndex];
        document.getElementById("pageCardholderName").value = option.dataset.name || "";
    };
}

async function handlePageIssueVirtualCard(event) {
    event.preventDefault();
    const userId = Number(document.getElementById("pageCardUserId").value);
    const cardholderName = document.getElementById("pageCardholderName").value.trim();
    const result = document.getElementById("pageIssuedVirtualCard");
    try {
        const card = await DataStore.createVirtualCard(userId, cardholderName);
        result.innerHTML = `<div class="issued-card-result"><p class="text-xs uppercase tracking-widest text-blue-100">Thẻ đã tạo thành công</p><p class="text-2xl font-bold tracking-widest mt-5">${card.cardNumber}</p><div class="flex justify-between text-xs mt-4"><span>${card.cardholderName}</span><span>HSD ${card.expiry}</span></div></div>`;
        result.classList.remove("hidden");
    } catch (error) {
        result.innerHTML = `<p class="text-sm text-red-600">${error.message || "Không thể tạo thẻ ảo."}</p>`;
        result.classList.remove("hidden");
    }
}

function openVirtualCardModal(userId, userName) {
    document.getElementById("virtualCardUserId").value = userId;
    document.getElementById("virtualCardUserLabel").innerText = `Khách hàng: ${userName}`;
    document.getElementById("virtualCardholderName").value = userName.toUpperCase();
    document.getElementById("issuedVirtualCard").classList.add("hidden");
    document.getElementById("virtualCardForm").classList.remove("hidden");
    document.getElementById("virtualCardModal").classList.remove("hidden");
}

function closeVirtualCardModal() {
    document.getElementById("virtualCardModal").classList.add("hidden");
}

async function handleIssueVirtualCard(event) {
    event.preventDefault();
    const userId = Number(document.getElementById("virtualCardUserId").value);
    const cardholderName = document.getElementById("virtualCardholderName").value.trim();
    const result = document.getElementById("issuedVirtualCard");
    try {
        const card = await DataStore.createVirtualCard(userId, cardholderName);
        result.innerHTML = `<div class="issued-card-result"><p class="text-xs uppercase tracking-widest text-blue-100">Thẻ đã tạo thành công</p><p class="text-2xl font-bold tracking-widest mt-5">${card.cardNumber}</p><div class="flex justify-between text-xs mt-4"><span>${card.cardholderName}</span><span>HSD ${card.expiry}</span></div></div><p class="text-xs text-gray-500 mt-3">Hãy lưu số thẻ này. Khách hàng chỉ nhìn thấy 4 số cuối.</p>`;
        result.classList.remove("hidden");
        document.getElementById("virtualCardForm").classList.add("hidden");
    } catch (error) {
        result.innerHTML = `<p class="text-sm text-red-600">${error.message || "Không thể cấp thẻ ảo."}</p>`;
        result.classList.remove("hidden");
    }
}

function openUserModal() {
    document.getElementById("newFullName").value = "";
    document.getElementById("newEmail").value = "";
    document.getElementById("newPhone").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("newRole").value = "user";
    document.getElementById("userModal").classList.remove("hidden");
}

function closeUserModal() {
    document.getElementById("userModal").classList.add("hidden");
}

async function handleCreateUser(e) {
    e.preventDefault();
    const fullName = document.getElementById("newFullName").value.trim();
    const email = document.getElementById("newEmail").value.trim();
    const phone = document.getElementById("newPhone").value.trim();
    const password = document.getElementById("newPassword").value.trim();
    const role = document.getElementById("newRole").value;

    try {
        await DataStore.register(fullName, email, password, phone);
    } catch (e) {}

    closeUserModal();
    await loadUsersTable();
    await loadOverviewStats();
    alert(`Đã tạo tài khoản "${fullName}" (${role}) thành công!`);
}

function loadTopupRequestsTable() {
    const table = document.getElementById("topupRequestsTable");
    if (!table) return;
    const requests = JSON.parse(localStorage.getItem("shop_topup_requests") || "[]");
    if (!requests.length) {
        table.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-gray-400">Chưa có yêu cầu nạp ví nào.</td></tr>';
        return;
    }

    table.innerHTML = requests.slice().reverse().map(request => {
        const statusClass = request.status === "Đã duyệt" ? "bg-green-50 text-green-700" : request.status === "Từ chối" ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700";
        const actions = request.status === "Chờ duyệt" ? `<button onclick="reviewTopup(${request.id}, 'Đã duyệt')" class="text-green-700 hover:bg-green-50 border border-green-200 rounded px-2 py-1 mr-1">Duyệt</button><button onclick="reviewTopup(${request.id}, 'Từ chối')" class="text-red-700 hover:bg-red-50 border border-red-200 rounded px-2 py-1">Từ chối</button>` : '<span class="text-xs text-gray-400">Đã xử lý</span>';
        return `<tr class="border-b hover:bg-gray-50"><td class="py-3 px-4 font-semibold">${request.userName || `User #${request.userId}`}</td><td class="py-3 px-4 font-bold text-blue-700">${Number(request.amount).toLocaleString('vi-VN')} đ</td><td class="py-3 px-4 text-xs">${new Date(request.createdAt).toLocaleString('vi-VN')}</td><td class="py-3 px-4"><span class="${statusClass} text-xs font-bold px-2 py-1 rounded-full">${request.status}</span></td><td class="py-3 px-4 text-center">${actions}</td></tr>`;
    }).join("");
}

function reviewTopup(requestId, status) {
    const requests = JSON.parse(localStorage.getItem("shop_topup_requests") || "[]");
    const request = requests.find(item => item.id === requestId);
    if (!request || request.status !== "Chờ duyệt") return;

    request.status = status;
    if (status === "Đã duyệt") {
        const balances = JSON.parse(localStorage.getItem("shop_wallet_balances") || "{}");
        balances[request.userId] = Number(balances[request.userId] || 0) + Number(request.amount);
        localStorage.setItem("shop_wallet_balances", JSON.stringify(balances));
    }
    localStorage.setItem("shop_topup_requests", JSON.stringify(requests));
    loadTopupRequestsTable();
}