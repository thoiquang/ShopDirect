document.addEventListener("DOMContentLoaded", () => {
    renderNavbar();
    renderFooter();
    updateCartBadge();
});

function renderNavbar() {
    const currentUser = DataStore.getCurrentUser();
    const navContainer = document.getElementById("navbarContainer");
    if (!navContainer) return;

    navContainer.innerHTML = `
    <header class="bg-white/95 backdrop-blur sticky top-0 z-40 border-b border-slate-200 shadow-sm">
        <div class="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <a href="home.html" class="text-2xl font-bold tracking-wide flex items-center gap-2">
                <span class="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center"><i class="fa-solid fa-bag-shopping text-sm"></i></span>
                <span class="text-slate-900">Shop<span class="text-blue-700">Direct</span></span>
            </a>
            
            <div class="flex-1 max-w-xl relative">
                <input type="text" id="globalSearchInput" placeholder="Bạn đang tìm gì hôm nay?" class="w-full pl-4 pr-10 py-2.5 rounded-lg text-gray-800 text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500">
                <button onclick="handleGlobalSearch()" class="absolute right-3 top-3 text-gray-500 hover:text-blue-700">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </button>
            </div>

            <div class="flex items-center space-x-4 text-sm">
                ${currentUser ? `
                    <div class="relative" id="userMenuWrapper">
                        <button onclick="toggleUserDropdown(event)" class="flex items-center gap-2 hover:text-blue-700 focus:outline-none font-semibold text-slate-700 px-2 py-1.5 rounded-lg transition">
                            <i class="fa-solid fa-circle-user text-lg text-blue-700"></i>
                            <span class="hidden md:inline">${currentUser.name || currentUser.fullName}</span>
                            <i class="fa-solid fa-chevron-down text-xs ml-1"></i>
                        </button>
                        <div id="userDropdownMenu" class="hidden absolute right-0 mt-2 w-52 bg-white text-gray-800 rounded-xl shadow-2xl border py-2 z-50">
                            <div class="px-4 py-2 border-b bg-gray-50">
                                <p class="font-bold text-xs text-blue-700 truncate">${currentUser.name || currentUser.fullName}</p>
                                <p class="text-[11px] text-gray-500 uppercase font-semibold mt-0.5">${currentUser.role === 'admin' ? 'Quản trị viên (Admin)' : 'Khách hàng'}</p>
                            </div>
                            <a href="profile.html" class="block px-4 py-2.5 text-xs hover:bg-blue-50 border-b transition"><i class="fa-solid fa-user-gear mr-2 text-blue-700"></i>Thông tin cá nhân</a>
                            <a href="orders.html" class="block px-4 py-2.5 text-xs hover:bg-blue-50 border-b transition"><i class="fa-solid fa-box mr-2 text-blue-700"></i>Đơn mua của tôi</a>
                            <a href="wallet.html" class="block px-4 py-2.5 text-xs hover:bg-blue-50 border-b transition"><i class="fa-solid fa-wallet mr-2 text-blue-700"></i>Ví mô phỏng</a>
                            <a href="virtual-card.html" class="block px-4 py-2.5 text-xs hover:bg-blue-50 border-b transition"><i class="fa-solid fa-credit-card mr-2 text-blue-700"></i>Thẻ ShopDirect ảo</a>
                            ${currentUser.role === 'admin' ? `
                                <a href="admin.html" class="block px-4 py-2.5 text-xs text-orange-600 hover:bg-orange-50 font-bold border-b transition">
                                    <i class="fa-solid fa-gauge-high mr-2 text-orange-500"></i> Trang Quản Trị
                                </a>
                            ` : ''}
                            <button onclick="logoutUser()" class="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition font-medium">
                                <i class="fa-solid fa-right-from-bracket"></i> Đăng xuất
                            </button>
                        </div>
                    </div>
                ` : `
                    <a href="login.html" class="flex items-center gap-1.5 hover:text-blue-700 font-medium text-slate-700 px-2 py-1.5 rounded-lg transition">
                        <i class="fa-regular fa-user text-base text-blue-700"></i>
                        <span class="hidden md:inline">Đăng nhập / Đăng ký</span>
                    </a>
                `}

                <a href="cart.html" class="flex items-center gap-1 text-slate-700 hover:text-blue-700 relative focus:outline-none p-1">
                    <i class="fa-solid fa-cart-shopping text-xl"></i>
                    <span id="navCartCount" class="bg-orange-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 absolute -top-1.5 -right-2">0</span>
                </a>
            </div>
        </div>

        <nav class="bg-blue-50 text-blue-900 text-sm border-t border-blue-100">
            <div class="container mx-auto px-4 flex items-center space-x-6 overflow-x-auto py-2.5">
                <a href="home.html" class="hover:text-blue-700 font-semibold whitespace-nowrap">Trang chủ</a>
                <a href="dientu.html" class="hover:text-blue-700 font-medium whitespace-nowrap">Thiết bị điện tử</a>
                <a href="thoitrang.html" class="hover:text-blue-700 font-medium whitespace-nowrap">Thời trang & Phụ kiện</a>
                <a href="giadung.html" class="hover:text-blue-700 font-medium whitespace-nowrap">Đồ gia dụng</a>
                <a href="sach.html" class="hover:text-blue-700 font-medium whitespace-nowrap">Sách & Văn phòng phẩm</a>
            </div>
        </nav>
    </header>
    `;
}

function toggleUserDropdown(event) {
    event.stopPropagation();
    const menu = document.getElementById("userDropdownMenu");
    if (menu) {
        menu.classList.toggle("hidden");
    }
}

document.addEventListener("click", (e) => {
    const menuWrapper = document.getElementById("userMenuWrapper");
    const menu = document.getElementById("userDropdownMenu");
    if (menu && menuWrapper && !menuWrapper.contains(e.target)) {
        menu.classList.add("hidden");
    }
});

function renderFooter() {
    const footerContainer = document.getElementById("footerContainer");
    if (!footerContainer) return;

    footerContainer.innerHTML = `
    <footer class="bg-gray-800 text-gray-300 mt-12 py-8">
        <div class="container mx-auto px-4 text-center">
            <p class="font-semibold text-lg text-white">Hệ Thống Bán Hàng Trực Tiếp - ShopDirect</p>
            <p class="text-sm text-gray-400 mt-1">Đồ án Thương Mại Điện Tử - ASP.NET Core & SQL Server</p>
            <p class="text-xs text-gray-500 mt-3">© 2026 ShopDirect. All rights reserved.</p>
        </div>
    </footer>
    `;
}

function updateCartBadge() {
    const cart = DataStore.getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById("navCartCount");
    if (badge) badge.innerText = count;
}

function logoutUser() {
    DataStore.setCurrentUser(null);
    alert("Đã đăng xuất thành công!");
    window.location.href = "home.html";
}

function handleGlobalSearch() {
    const query = document.getElementById("globalSearchInput")?.value.trim();
    if (query) {
        window.location.href = `home.html?search=${encodeURIComponent(query)}`;
    }
}