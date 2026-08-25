function handleLoginSuccess(user) {
    DataStore.setCurrentUser(user);
    if (user.role === "admin") {
        window.location.href = "admin.html";
    } else {
        // Kiểm tra nếu có hàng trong giỏ thì ưu tiên về checkout
        const cart = DataStore.getCart();
        if (cart && cart.length > 0) {
            window.location.href = "checkout.html";
        } else {
            window.location.href = "home.html";
        }
    }
}