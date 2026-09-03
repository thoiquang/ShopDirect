document.addEventListener("DOMContentLoaded", async () => {
    if (!DataStore.getCurrentUser()) { window.location.href = "login.html"; return; }
    const orders = await DataStore.getMyOrders();
    const container = document.getElementById("ordersList");
    if (!orders.length) { container.innerHTML = '<div class="bg-white border rounded-xl p-10 text-center text-gray-400">Bạn chưa có đơn hàng nào.</div>'; return; }
    container.innerHTML = orders.map(order => {
        const status = order.orderStatus || order.status || "Chờ xử lý";
        const returned = JSON.parse(localStorage.getItem("shop_returns") || "[]").find(item => String(item.orderId) === String(order.orderId));
        return `<article class="bg-white border rounded-xl p-5 shadow-sm"><div class="flex flex-wrap justify-between gap-3 border-b pb-3"><div><p class="font-bold text-indigo-600">${order.orderCode || order.orderId}</p><p class="text-xs text-gray-500">${new Date(order.createdAt).toLocaleString('vi-VN')}</p></div><span class="text-sm font-bold ${status === 'Hoàn tất' ? 'text-green-600' : status === 'Đã hủy' ? 'text-red-600' : 'text-orange-600'}">${status}</span></div><div class="py-4 flex flex-wrap justify-between gap-3"><p class="text-sm text-gray-600">${order.customerAddress || 'Địa chỉ nhận hàng chưa có'}</p><p class="font-extrabold">${Number(order.totalAmount || 0).toLocaleString('vi-VN')} đ</p></div><div class="flex flex-wrap gap-2"><a href="invoice.html?id=${order.orderId}" class="px-3 py-2 text-sm font-semibold border rounded-lg text-indigo-600"><i class="fa-solid fa-receipt mr-1"></i>Xem hóa đơn</a>${status === 'Hoàn tất' ? `<button onclick="requestReturn('${order.orderId}')" class="px-3 py-2 text-sm font-semibold border rounded-lg text-red-600">${returned ? 'Đã yêu cầu trả hàng' : 'Yêu cầu trả hàng'}</button>` : ''}</div>${returned ? `<p class="mt-3 text-xs text-orange-600">Trả hàng: ${returned.reason} | ${returned.status}</p>` : ''}</article>`;
    }).join("");
});

function requestReturn(orderId) {
    const reason = prompt("Lý do trả hàng / hàng lỗi:");
    if (!reason?.trim()) return;
    const returns = JSON.parse(localStorage.getItem("shop_returns") || "[]");
    returns.push({ orderId, reason: reason.trim(), status: "Chờ duyệt", createdAt: new Date().toISOString() });
    localStorage.setItem("shop_returns", JSON.stringify(returns));
    window.location.reload();
}