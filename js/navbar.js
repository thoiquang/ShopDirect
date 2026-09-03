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
    <header class="bg-indigo-600 text-white sticky top-0 z-40 shadow-md">
        <div class="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <a href="home.html" class="text-2xl font-bold tracking-wide flex items-center gap-2">
                <i class="fa-solid fa-store"></i>
                <span>ShopDirect</span>
            </a>
            
            <div class="flex-1 max-w-xl relative">
                <input type="text" id="globalSearchInput" placeholder="Tìm kiếm sản phẩm..." class="w-full pl-4 pr-10 py-2 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <button onclick="handleGlobalSearch()" class="absolute right-3 top-2.5 text-gray-500 hover:text-indigo-600">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </button>
            </div>

            <div class="flex items-center space-x-6 text-sm">
                ${currentUser ? `
                    <div class="relative" id="userMenuWrapper">
                        <button onclick="toggleUserDropdown(event)" class="flex items-center gap-2 hover:text-indigo-200 focus:outline-none font-semibold bg-indigo-700 hover:bg-indigo-800 px-3 py-1.5 rounded-lg transition">
                            <i class="fa-solid fa-circle-user text-lg"></i>
                            <span class="hidden md:inline">${currentUser.name || currentUser.fullName}</span>
                            <i class="fa-solid fa-chevron-down text-xs ml-1"></i>
                        </button>
                        <div id="userDropdownMenu" class="hidden absolute right-0 mt-2 w-52 bg-white text-gray-800 rounded-xl shadow-2xl border py-2 z-50">
                            <div class="px-4 py-2 border-b bg-gray-50">
                                <p class="font-bold text-xs text-indigo-600 truncate">${currentUser.name || currentUser.fullName}</p>
                                <p class="text-[11px] text-gray-500 uppercase font-semibold mt-0.5">${currentUser.role === 'admin' ? 'Quản trị viên (Admin)' : 'Khách hàng'}</p>
                            </div>
                            <a href="profile.html" class="block px-4 py-2.5 text-xs hover:bg-indigo-50 border-b transition"><i class="fa-solid fa-user-gear mr-2 text-indigo-600"></i>Thông tin cá nhân</a>
                            <a href="orders.html" class="block px-4 py-2.5 text-xs hover:bg-indigo-50 border-b transition"><i class="fa-solid fa-box mr-2 text-indigo-600"></i>Đơn mua của tôi</a>
                            ${currentUser.role === 'admin' ? `
                                <a href="admin.html" class="block px-4 py-2.5 text-xs text-purple-700 hover:bg-purple-50 font-bold border-b transition">
                                    <i class="fa-solid fa-gauge-high mr-2 text-purple-600"></i> Trang Quản Trị
                                </a>
                            ` : ''}
                            <button onclick="logoutUser()" class="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition font-medium">
                                <i class="fa-solid fa-right-from-bracket"></i> Đăng xuất
                            </button>
                        </div>
                    </div>
                ` : `
                    <a href="login.html" class="flex items-center gap-1.5 hover:text-indigo-200 font-medium bg-indigo-700 hover:bg-indigo-800 px-3 py-1.5 rounded-lg transition">
                        <i class="fa-regular fa-user text-base"></i>
                        <span class="hidden md:inline">Đăng nhập / Đăng ký</span>
                    </a>
                `}

                <a href="cart.html" class="flex items-center gap-1 hover:text-indigo-200 relative focus:outline-none p-1">
                    <i class="fa-solid fa-cart-shopping text-xl"></i>
                    <span id="navCartCount" class="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 absolute -top-1.5 -right-2">0</span>
                </a>
            </div>
        </div>

        <nav class="bg-indigo-800 text-indigo-100 text-sm">
            <div class="container mx-auto px-4 flex items-center space-x-6 overflow-x-auto py-2">
                <a href="home.html" class="hover:text-white font-medium whitespace-nowrap">Trang chủ</a>
                <a href="dientu.html" class="hover:text-white font-medium whitespace-nowrap">Thiết bị điện tử</a>
                <a href="thoitrang.html" class="hover:text-white font-medium whitespace-nowrap">Thời trang & Phụ kiện</a>
                <a href="giadung.html" class="hover:text-white font-medium whitespace-nowrap">Đồ gia dụng</a>
                <a href="sach.html" class="hover:text-white font-medium whitespace-nowrap">Sách & Văn phòng phẩm</a>
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