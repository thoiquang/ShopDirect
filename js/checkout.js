
document.addEventListener("DOMContentLoaded", () => {
    const cart = DataStore.getCart();
    if (cart.length === 0) {
        alert("Giỏ hàng đang trống!");
        window.location.href = "home.html";
        return;
    }

    const user = DataStore.getCurrentUser();
    if (user) {
        document.getElementById("custName").value = user.name || "";
    }

    renderCheckoutSummary();
});

function renderCheckoutSummary() {
    const cart = DataStore.getCart();
    const container = document.getElementById("checkoutSummary");
    let total = 0;

    container.innerHTML = "";
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const row = document.createElement("div");
        row.className = "flex justify-between text-gray-700 text-xs sm:text-sm";
        row.innerHTML = `<span>${item.name} x${item.quantity}</span><span class="font-bold">${itemTotal.toLocaleString('vi-VN')} đ</span>`;
        container.appendChild(row);
    });

    const totalRow = document.createElement("div");
    totalRow.className = "flex justify-between font-extrabold text-base text-indigo-600 pt-2 border-t mt-2";
    totalRow.innerHTML = `<span>Tổng tiền:</span><span>${total.toLocaleString('vi-VN')} đ</span>`;
    container.appendChild(totalRow);

    const memo = "SD" + Math.floor(100000 + Math.random() * 900000);
    document.getElementById("qrMemo").innerText = memo;
    document.getElementById("qrImg").src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://shopdirect.vn/pay?amount=${total}%26memo=${memo}`;
}

function toggleQR(show) {
    const qrArea = document.getElementById("qrArea");
    if (show) qrArea.classList.remove("hidden");
    else qrArea.classList.add("hidden");
}

function handleCheckout(e) {
    e.preventDefault();
    const cart = DataStore.getCart();
    const name = document.getElementById("custName").value;
    const phone = document.getElementById("custPhone").value;
    const address = document.getElementById("custAddress").value;
    const payMethod = document.querySelector('input[name="payMethod"]:checked').value;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newOrder = {
        orderId: "HD" + Date.now().toString().slice(-6),
        customer: { name, phone, address },
        items: cart,
        total: total,
        paymentMethod: payMethod === 'COD' ? 'Thanh toán COD' : 'Chuyển khoản QR',
        createdAt: new Date().toLocaleString('vi-VN')
    };

    const orders = DataStore.getOrders();
    orders.push(newOrder);
    DataStore.saveOrders(orders);

    DataStore.saveCart([]);
    alert(`Đặt hàng thành công! Mã đơn hàng của bạn là: ${newOrder.orderId}`);
    window.location.href = "home.html";
}
