
document.addEventListener("DOMContentLoaded", () => {
    const user = DataStore.getCurrentUser();
    if (!user || user.role !== 'admin') {
        alert("Bạn cần đăng nhập bằng tài khoản Admin để truy cập!");
        window.location.href = "login.html";
        return;
    }

    const orders = DataStore.getOrders();
    const products = DataStore.getProducts();
    const users = DataStore.getUsers();

    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    document.getElementById("admRevenue").innerText = `${revenue.toLocaleString('vi-VN')} đ`;
    document.getElementById("admOrdersCount").innerText = orders.length;
    document.getElementById("admProductsCount").innerText = products.length;
    document.getElementById("admUsersCount").innerText = users.length;

    const table = document.getElementById("admOrdersTable");
    table.innerHTML = "";
    orders.reverse().forEach(o => {
        const tr = document.createElement("tr");
        tr.className = "border-b hover:bg-gray-50";
        tr.innerHTML = `
            <td class="py-3 px-4 font-bold text-indigo-600">${o.orderId}</td>
            <td class="py-3 px-4 font-semibold">${o.customer.name} (${o.customer.phone})</td>
            <td class="py-3 px-4 text-xs">${o.paymentMethod}</td>
            <td class="py-3 px-4 font-bold">${o.total.toLocaleString('vi-VN')} đ</td>
            <td class="py-3 px-4 text-xs">${o.createdAt}</td>
        `;
        table.appendChild(tr);
    });
});
