document.addEventListener("DOMContentLoaded", () => {
    const user = DataStore.getCurrentUser();
    const cart = DataStore.getCart();

    if (!cart || cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        window.location.href = "cart.html";
        return;
    }

    if (!user) {
        alert("Vui lòng đăng nhập để thanh toán!");
        window.location.href = "login.html";
        return;
    }

    // Tự động điền thông tin nếu có sẵn từ tài khoản
    if (user.fullName) document.getElementById("fullName").value = user.fullName;
    if (user.email) document.getElementById("email").value = user.email;
    if (user.phone) document.getElementById("phone").value = user.phone;
    if (user.address) document.getElementById("address").value = user.address;

    renderCheckoutSummary();

    // Lắng nghe sự kiện submit đặt hàng
    const checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handlePlaceOrder();
        });
    }
});

function renderCheckoutSummary() {
    const cart = DataStore.getCart();
    const container = document.getElementById("checkoutItemsList");
    const subTotalElem = document.getElementById("subTotal");
    const finalTotalElem = document.getElementById("finalTotal");

    container.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const div = document.createElement("div");
        div.className = "flex items-center justify-between gap-3 text-sm";
        div.innerHTML = `
            <div class="flex items-center gap-2 truncate">
                <img src="${item.imageUrl}" class="w-10 h-10 object-cover rounded border">
                <span class="truncate font-medium">${item.productName} x${item.quantity}</span>
            </div>
            <span class="font-bold whitespace-nowrap">${Number(itemTotal).toLocaleString('vi-VN')} đ</span>
        `;
        container.appendChild(div);
    });

    subTotalElem.innerText = `${Number(total).toLocaleString('vi-VN')} đ`;
    finalTotalElem.innerText = `${Number(total).toLocaleString('vi-VN')} đ`;
}

async function handlePlaceOrder() {
    const cart = DataStore.getCart();
    const user = DataStore.getCurrentUser();
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderData = {
        userId: user.userId,
        customerName: document.getElementById("fullName").value.trim(),
        customerPhone: document.getElementById("phone").value.trim(),
        customerAddress: document.getElementById("address").value.trim(),
        totalAmount,
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
        items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price
        }))
    };

    try {
        const order = await DataStore.createOrder(orderData);
        alert("Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại ShopDirect.");
        localStorage.removeItem("shop_cart");
        window.location.href = `invoice.html?id=${order.orderId}`;
    } catch (error) {
        alert(error.message || "Không thể đặt hàng. Vui lòng thử lại.");
    }
}