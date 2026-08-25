document.addEventListener("DOMContentLoaded", () => {
    const cart = DataStore.getCart();
    if (!cart || cart.length === 0) {
        alert("Giỏ hàng đang trống! Vui lòng chọn sản phẩm trước khi thanh toán.");
        window.location.href = "home.html";
        return;
    }

    const user = DataStore.getCurrentUser();
    if (user) {
        document.getElementById("custName").value = user.name || user.fullName || "";
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
        row.className = "flex justify-between text-gray-700 text-xs sm:text-sm py-1";
        row.innerHTML = `<span>${item.productName} <b class="text-indigo-600">x${item.quantity}</b></span><span class="font-bold">${Number(itemTotal).toLocaleString('vi-VN')} đ</span>`;
        container.appendChild(row);
    });

    const totalRow = document.createElement("div");
    totalRow.className = "flex justify-between font-extrabold text-base text-indigo-600 pt-3 border-t mt-2";
    totalRow.innerHTML = `<span>Tổng tiền thanh toán:</span><span>${Number(total).toLocaleString('vi-VN')} đ</span>`;
    container.appendChild(totalRow);

    const memo = "SD" + Math.floor(100000 + Math.random() * 900000);
    const memoElem = document.getElementById("qrMemo");
    const imgElem = document.getElementById("qrImg");
    if (memoElem) memoElem.innerText = memo;
    if (imgElem) imgElem.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://shopdirect.vn/pay?amount=${total}%26memo=${memo}`;
}

function toggleQR(show) {
    const qrArea = document.getElementById("qrArea");
    if (show) qrArea.classList.remove("hidden");
    else qrArea.classList.add("hidden");
}

async function handleCheckout(e) {
    e.preventDefault();
    const cart = DataStore.getCart();
    if (!cart || cart.length === 0) {
        alert("Giỏ hàng trống!");
        window.location.href = "home.html";
        return;
    }

    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const address = document.getElementById("custAddress").value.trim();
    const payMethod = document.querySelector('input[name="payMethod"]:checked').value;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderPayload = {
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        totalAmount: total,
        paymentMethod: payMethod === 'COD' ? 'Thanh toán COD' : 'Chuyển khoản QR',
        items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price
        }))
    };

    try {
        const orderResult = await DataStore.createOrder(orderPayload);
        DataStore.saveCart([]);
        updateCartBadge();
        alert(`🎉 Đặt hàng thành công!\nMã đơn hàng của bạn: ${orderResult.orderCode || orderResult.orderId}`);
        window.location.href = "home.html";
    } catch (error) {
        alert("Lỗi khi tạo đơn hàng: " + error.message);
    }
}