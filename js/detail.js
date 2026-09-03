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
        <section class="mt-8 border-t pt-6">
            <div class="flex items-center justify-between mb-4"><h2 class="text-xl font-bold">Đánh giá sản phẩm</h2><span id="reviewAverage" class="text-sm text-orange-500 font-bold"></span></div>
            <div id="reviewList" class="space-y-3 mb-5"></div>
            <form id="reviewForm" class="bg-gray-50 border rounded-xl p-4 space-y-3">
                <div><label class="block text-sm font-semibold mb-1">Số sao</label><select id="reviewRating" class="border rounded-lg px-3 py-2"><option value="5">5 sao</option><option value="4">4 sao</option><option value="3">3 sao</option><option value="2">2 sao</option><option value="1">1 sao</option></select></div>
                <textarea id="reviewComment" required rows="3" placeholder="Chia sẻ trải nghiệm của bạn..." class="w-full border rounded-lg px-3 py-2"></textarea>
                <button class="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg">Gửi đánh giá</button>
            </form>
        </section>
    `;

    renderReviews(productId);
    document.getElementById("reviewForm").addEventListener("submit", event => {
        event.preventDefault();
        const user = DataStore.getCurrentUser();
        if (!user) { alert("Vui lòng đăng nhập để đánh giá sản phẩm."); return; }
        DataStore.createReview(productId, { rating: Number(document.getElementById("reviewRating").value), comment: document.getElementById("reviewComment").value.trim() }).then(() => {
            document.getElementById("reviewComment").value = "";
            renderReviews(productId);
        });
    });

    document.getElementById("detailAddToCartBtn").onclick = () => {
        DataStore.addToCart(product);
        updateCartBadge();
    };

    document.getElementById("detailBuyNowBtn").onclick = () => {
        DataStore.addToCart(product);
        window.location.href = "checkout.html";
    };
});

async function renderReviews(productId) {
    const reviews = await DataStore.getReviews(productId);
    const list = document.getElementById("reviewList");
    const average = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "Chưa có đánh giá";
    document.getElementById("reviewAverage").innerText = reviews.length ? `${average}/5 (${reviews.length} đánh giá)` : average;
    list.innerHTML = reviews.length ? reviews.map(review => `<div class="border rounded-lg p-3"><div class="flex justify-between"><strong>${review.name || 'Khách hàng'}</strong><span class="text-orange-500">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span></div><p class="text-sm text-gray-600 mt-1">${review.comment}</p></div>`).join("") : '<p class="text-sm text-gray-400">Hãy là người đầu tiên đánh giá sản phẩm này.</p>';
}