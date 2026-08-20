document.addEventListener("DOMContentLoaded", async () => {
    const products = await DataStore.getProductsByCategory('thoitrang');
    renderCategoryProducts(products);
});

function renderCategoryProducts(items) {
    const grid = document.getElementById("productGrid");
    const countText = document.getElementById("productCount");
    
    grid.innerHTML = "";
    countText.innerText = `Hiển thị ${items.length} sản phẩm`;

    if (!items || items.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center py-12 text-gray-400 font-medium">Hiện chưa có sản phẩm trong danh mục này.</p>`;
        return;
    }

    items.forEach(product => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col justify-between";
        card.innerHTML = `
            <a href="detail.html?id=${product.productId}" class="block">
                <img src="${product.imageUrl}" alt="${product.productName}" class="w-full h-48 object-cover hover:scale-105 transition duration-300">
                <div class="p-4">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        Thời Trang & Phụ Kiện
                    </span>
                    <h3 class="font-semibold text-gray-800 mt-2 text-base line-clamp-1 hover:text-indigo-600">${product.productName}</h3>
                    <p class="text-indigo-600 font-bold text-lg mt-2">${Number(product.price).toLocaleString('vi-VN')} đ</p>
                </div>
            </a>
            <div class="p-4 pt-0">
                <button id="btn_cat_add_${product.productId}" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2 rounded-lg transition flex items-center justify-center gap-2">
                    <i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ
                </button>
            </div>
        `;
        grid.appendChild(card);

        document.getElementById(`btn_cat_add_${product.productId}`).onclick = () => {
            DataStore.addToCart(product);
            updateCartBadge();
        };
    });
}