
function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const pass = document.getElementById("loginPass").value.trim();

    const users = DataStore.getUsers();
    const user = users.find(u => u.email === email && u.pass === pass);

    if (user) {
        DataStore.setCurrentUser(user);
        alert(`Đăng nhập thành công! Xin chào, ${user.name}`);
        if (user.role === 'admin') {
            window.location.href = "admin.html";
        } else {
            window.location.href = "home.html";
        }
    } else {
        alert("Email hoặc mật khẩu không đúng!");
    }
}

function handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const pass = document.getElementById("regPass").value.trim();

    const users = DataStore.getUsers();
    if (users.some(u => u.email === email)) {
        alert("Email này đã được sử dụng!");
        return;
    }

    const newUser = { id: Date.now(), name, email, pass, role: "user" };
    users.push(newUser);
    localStorage.setItem("shop_users", JSON.stringify(users));

    alert("Đăng ký tài khoản thành công! Mời bạn đăng nhập.");
    window.location.href = "login.html";
}
