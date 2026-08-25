document.addEventListener("DOMContentLoaded", () => {
    renderCart();
});

function renderCart() {
    const cart = DataStore.getCart();
    const container = document.getElementById("cartTableContainer");
    const totalSumElem = document.getElementById("cartTotalSum");
    const checkoutBtn = document.getElementById("checkoutBtn");

    if (!cart || cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-400">
                <i class="fa-solid fa-basket-shopping text-5xl mb-3"></i>
                <p class="font-medium">Giỏ hàng của bạn đang trống</p>
                <a href="home.html" class="inline-block mt-4 text-indigo-600 font-bold hover:underline">Khám phá sản phẩm ngay</a>
            </div>
        `;
        totalSumElem.innerText = "0 đ";
        if (checkoutBtn) checkoutBtn.classList.add("pointer-events-none", "opacity-50");
        return;
    }

    if (checkoutBtn) checkoutBtn.classList.remove("pointer-events-none", "opacity-50");
    container.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const row = document.createElement("div");
        row.className = "flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border";
        row.innerHTML = `
            <div class="flex items-center gap-4 w-full sm:w-auto">
                <img src="${item.imageUrl}" alt="${item.productName}" class="w-16 h-16 object-cover rounded-lg border">
                <div>
                    <h3 class="font-bold text-gray-800 text-sm">${item.productName}</h3>
                    <p class="text-indigo-600 font-bold text-sm">${Number(item.price).toLocaleString('vi-VN')} đ</p>
                </div>
            </div>
            <div class="flex items-center gap-6 justify-between w-full sm:w-auto">
                <div class="flex items-center gap-2 border bg-white rounded-lg px-2 py-1">
                    <button onclick="changeQty(${item.productId}, -1)" class="text-gray-500 hover:text-indigo-600 font-bold px-2">-</button>
                    <span class="font-bold text-sm px-2">${item.quantity}</span>
                    <button onclick="changeQty(${item.productId}, 1)" class="text-gray-500 hover:text-indigo-600 font-bold px-2">+</button>
                </div>
                <p class="font-extrabold text-gray-800 text-sm min-w-[100px] text-right">${Number(itemTotal).toLocaleString('vi-VN')} đ</p>
                <button onclick="removeItem(${item.productId})" class="text-red-500 hover:text-red-700 p-1">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        container.appendChild(row);
    });

    totalSumElem.innerText = `${Number(total).toLocaleString('vi-VN')} đ`;
}

function changeQty(productId, delta) {
    const cart = DataStore.getCart();
    const item = cart.find(i => i.productId === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeItem(productId);
            return;
        }
        DataStore.saveCart(cart);
        renderCart();
        updateCartBadge();
    }
}

function removeItem(productId) {
    let cart = DataStore.getCart();
    cart = cart.filter(i => i.productId !== productId);
    DataStore.saveCart(cart);
    renderCart();
    updateCartBadge();
}

function goToCheckout() {
    const cart = DataStore.getCart();
    if (!cart || cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }
    window.location.href = "checkout.html";
}