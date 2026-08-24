document.addEventListener("DOMContentLoaded", () => {
    renderCheckoutSummary();

    const form = document.getElementById("checkoutForm");
    if (form) {
        form.addEventListener("submit", handleCheckoutSubmit);
    }
});

function renderCheckoutSummary() {
    const cart = DataStore.getCart();
    const itemsList = document.getElementById("checkoutItemsList");
    const subtotalEl = document.getElementById("checkoutSubtotal");
    const shippingEl = document.getElementById("checkoutShipping");
    const totalEl = document.getElementById("checkoutTotal");

    if (!itemsList) return;

    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống! Vui lòng chọn sản phẩm trước khi thanh toán.");
        window.location.href = "home.html";
        return;
    }

    itemsList.innerHTML = "";
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const row = document.createElement("div");
        row.className = "flex items-center justify-between text-sm py-2 border-b border-gray-100";
        row.innerHTML = `
            <div class="flex items-center gap-3">
                <img src="${item.imageUrl}" class="w-10 h-10 object-cover rounded-lg border">
                <div>
                    <p class="font-semibold text-gray-800 line-clamp-1">${item.productName}</p>
                    <p class="text-xs text-gray-500">Số lượng: ${item.quantity}</p>
                </div>
            </div>
            <span class="font-bold text-gray-700">${Number(itemTotal).toLocaleString('vi-VN')} đ</span>
        `;
        itemsList.appendChild(row);
    });

    const shipping = subtotal > 500000 ? 0 : 30000;
    const total = subtotal + shipping;

    if (subtotalEl) subtotalEl.innerText = `${Number(subtotal).toLocaleString('vi-VN')} đ`;
    if (shippingEl) shippingEl.innerText = shipping === 0 ? "Miễn phí" : `${Number(shipping).toLocaleString('vi-VN')} đ`;
    if (totalEl) totalEl.innerText = `${Number(total).toLocaleString('vi-VN')} đ`;
}

async function handleCheckoutSubmit(e) {
    e.preventDefault();

    const cart = DataStore.getCart();
    if (cart.length === 0) return;

    const fullName = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const address = document.getElementById("custAddress").value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || "COD";

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 500000 ? 0 : 30000;
    const totalAmount = subtotal + shipping;

    const orderPayload = {
        customerName: fullName,
        customerPhone: phone,
        customerAddress: address,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản Ngân hàng / QR"
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Đang xử lý đơn hàng...";
    }

    try {
        const result = await DataStore.createOrder(orderPayload);
        DataStore.saveCart([]); // Xóa giỏ hàng sau khi đặt thành công
        updateCartBadge();

        alert(`🎉 Đặt hàng thành công!\nMã đơn hàng: ${result.orderCode || result.orderId}\nCảm ơn bạn đã mua sắm tại ShopDirect!`);
        window.location.href = "home.html";
    } catch (err) {
        alert("Có lỗi xảy ra khi tạo đơn hàng, vui lòng thử lại!");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Xác nhận đặt hàng";
        }
    }
}