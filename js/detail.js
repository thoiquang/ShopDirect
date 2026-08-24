document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get("id")) || 1;

    const product = await DataStore.getProductById(productId);
    renderProductDetail(product);
});

function renderProductDetail(product) {
    if (!product) {
        document.getElementById("detailContainer").innerHTML = `
            <div class="text-center py-16">
                <p class="text-gray-500 font-semibold text-lg">Không tìm thấy sản phẩm yêu cầu.</p>
                <a href="home.html" class="mt-4 inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition">Quay về trang chủ</a>
            </div>
        `;
        return;
    }

    document.getElementById("detailImage").src = product.imageUrl;
    document.getElementById("detailName").innerText = product.productName;
    document.getElementById("detailCategory").innerText = product.categoryName || "Sản phẩm";
    document.getElementById("detailPrice").innerText = `${Number(product.price).toLocaleString('vi-VN')} đ`;
    document.getElementById("detailDescription").innerText = product.description || "Chưa có mô tả chi tiết cho sản phẩm này.";

    // Nút Thêm vào giỏ hàng
    const btnAdd = document.getElementById("btnAddToCart");
    if (btnAdd) {
        btnAdd.onclick = () => {
            const qty = parseInt(document.getElementById("detailQuantity")?.value) || 1;
            for (let i = 0; i < qty; i++) {
                DataStore.addToCart(product);
            }
            updateCartBadge();
        };
    }

    // Nút Mua ngay
    const btnBuyNow = document.getElementById("btnBuyNow");
    if (btnBuyNow) {
        btnBuyNow.onclick = () => {
            const qty = parseInt(document.getElementById("detailQuantity")?.value) || 1;
            for (let i = 0; i < qty; i++) {
                DataStore.addToCart(product);
            }
            updateCartBadge();
            window.location.href = "checkout.html";
        };
    }
}