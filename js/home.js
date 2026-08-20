document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchKeyword = urlParams.get('search');

    let products = await DataStore.getProducts();

    if (searchKeyword) {
        products = products.filter(p => p.productName.toLowerCase().includes(searchKeyword.toLowerCase()));
        document.getElementById("pageTitle").innerText = `Kết quả tìm kiếm: "${searchKeyword}"`;
    }

    renderHomeProducts(products);
});

function renderHomeProducts(items) {
    const grid = document.getElementById("productGrid");
    const countText = document.getElementById("productCount");
    
    grid.innerHTML = "";
    countText.innerText = `Hiển thị ${items.length} sản phẩm`;

    if (items.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center py-12 text-gray-400 font-medium">Không tìm thấy sản phẩm nào phù hợp.</p>`;
        return;
    }

    items.forEach(product => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col justify-between";
        card.innerHTML = `
            <a href="detail.html?id=${product.productId}" class="block">
                <img src="${product.imageUrl}" alt="${product.productName}" class="w-full h-48 object-cover hover:scale-105 transition duration-300">
                <div class="p-4">
                    <h3 class="font-semibold text-gray-800 mt-2 text-base line-clamp-1 hover:text-indigo-600">${product.productName}</h3>
                    <p class="text-indigo-600 font-bold text-lg mt-2">${product.price.toLocaleString('vi-VN')} đ</p>
                </div>
            </a>
            <div class="p-4 pt-0">
                <button id="addBtn_${product.productId}" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2 rounded-lg transition flex items-center justify-center gap-2">
                    <i class="fa-solid fa-cart-plus"></i> Thêm vào giỏ
                </button>
            </div>
        `;
        grid.appendChild(card);

        document.getElementById(`addBtn_${product.productId}`).onclick = () => {
            DataStore.addToCart(product);
            updateCartBadge();
        };
    });
}