function getPendingCheckout() {
    return JSON.parse(sessionStorage.getItem("shop_pending_checkout") || "null");
}

function formatPaymentAmount(value) {
    return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

document.addEventListener("DOMContentLoaded", () => {
    const pending = getPendingCheckout();
    const content = document.getElementById("paymentContent");
    const button = document.getElementById("confirmPayment");
    const message = document.getElementById("paymentMessage");

    if (!pending) {
        content.innerHTML = '<p class="text-center text-gray-500 py-8">Không có giao dịch đang chờ.</p>';
        button.disabled = true;
        return;
    }

    const isCard = pending.paymentMethod === "CARD";
    const currentUser = DataStore.getCurrentUser();
    const card = JSON.parse(localStorage.getItem(`shop_virtual_card_${currentUser?.userId}`) || "null");
    if (isCard && !card) {
        content.innerHTML = '<div class="text-center py-6"><i class="fa-solid fa-credit-card text-4xl text-blue-700 mb-3"></i><h2 class="font-bold text-xl">Bạn chưa có thẻ ShopDirect ảo</h2><p class="text-sm text-gray-500 mt-2">Tạo một thẻ ảo nội bộ trước khi thanh toán.</p><a href="virtual-card.html" class="inline-block shop-action rounded-lg px-4 py-2 mt-5 font-bold">Mở trang thẻ ảo</a></div>';
        button.classList.add("hidden");
        return;
    }

    if (isCard) {
        content.innerHTML = `<div class="shop-virtual-card mb-5"><p class="text-xs uppercase tracking-widest text-blue-100">ShopDirect Card</p><p class="text-xl tracking-widest mt-6">**** **** **** ${card.number.slice(-4)}</p><div class="flex justify-between text-xs mt-5"><span>${card.name}</span><span>DEMO</span></div></div><div class="flex justify-between border-t pt-4 font-bold"><span>Số tiền thanh toán</span><span class="text-blue-700">${formatPaymentAmount(pending.totalAmount)}</span></div>`;
    } else {
        const qrData = encodeURIComponent(`SHOPDIRECT-DEMO|${pending.orderCode}|${pending.totalAmount}|NO_REAL_PAYMENT`);
        content.innerHTML = `<div class="text-center"><div class="inline-block bg-white border-8 border-slate-100 rounded-xl"><img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}" alt="QR thanh toán mô phỏng" width="220" height="220"></div><h2 class="font-bold text-xl mt-5">Quét mã QR mô phỏng</h2><p class="text-sm text-gray-500 mt-2">Mã chỉ dùng để minh họa giao diện ShopDirect Pay, không chuyển tiền thật.</p></div><div class="flex justify-between border-t pt-4 mt-5 font-bold"><span>Số tiền thanh toán</span><span class="text-blue-700">${formatPaymentAmount(pending.totalAmount)}</span></div>`;
    }

    button.addEventListener("click", async () => {
        button.disabled = true;
        try {
            const order = await DataStore.createOrder(pending.orderData);
            sessionStorage.removeItem("shop_pending_checkout");
            localStorage.removeItem("shop_cart");
            window.location.href = `invoice.html?id=${order.orderId}`;
        } catch (error) {
            message.className = "text-sm mt-4 text-red-600";
            message.innerText = error.message || "Không thể xác nhận thanh toán.";
            button.disabled = false;
        }
    });
});
