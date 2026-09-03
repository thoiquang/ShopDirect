async function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const pass = document.getElementById("loginPass").value.trim();

    try {
        const user = await DataStore.login(email, pass);
        DataStore.setCurrentUser({
            userId: user.userId,
            name: user.fullName,
            email: user.email,
            role: user.role
        });
        alert(`Đăng nhập thành công! Xin chào, ${user.fullName}`);
        if (user.role === 'admin') {
            window.location.href = "admin.html";
        } else {
            window.location.href = "home.html";
        }
    } catch (err) {
        alert(err.message);
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const pass = document.getElementById("regPass").value.trim();

    try {
        await DataStore.register(name, email, pass);
        alert("Đăng ký tài khoản thành công! Mời bạn đăng nhập.");
        window.location.href = "login.html";
    } catch (err) {
        alert(err.message);
    }
}