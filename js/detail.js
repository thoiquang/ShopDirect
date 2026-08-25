document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = "home.html";
        return;
    }

    const product = await DataStore.getProductById(productId);
    const container = document.getElementById("detailContainer");

    if (!product) {
        container.innerHTML = `<p class="text-center py-12 text-gray-500">Sản phẩm không tồn tại hoặc đã bị xóa.</p>`;
        return;
    }

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <img src="${product.imageUrl}" alt="${product.productName}" class="w-full h-80 object-cover rounded-xl border">
            <div>
                <span class="text-xs font-bold uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
                    ${product.categoryName || 'Sản phẩm'}
                </span>
                <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mt-3">${product.productName}</h1>
                <p class="text-2xl font-extrabold text-indigo-600 mt-3">${Number(product.price).toLocaleString('vi-VN')} đ</p>
                <div class="mt-4 pt-4 border-t border-gray-100">
                    <h3 class="font-bold text-gray-700 text-sm mb-1">Mô tả sản phẩm:</h3>
                    <p class="text-sm text-gray-600 leading-relaxed">${product.description || 'Sản phẩm chính hãng chất lượng cao.'}</p>
                </div>
                <div class="mt-6 flex gap-4">
                    <button id="detailAddToCartBtn" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow">
                        <i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ hàng
                    </button>
                    <button id="detailBuyNowBtn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center shadow">
                        Mua ngay
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById("detailAddToCartBtn").onclick = () => {
        DataStore.addToCart(product);
        updateCartBadge();
    };

    document.getElementById("detailBuyNowBtn").onclick = () => {
        DataStore.addToCart(product);
        window.location.href = "checkout.html";
    };
});