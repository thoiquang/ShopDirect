document.addEventListener("DOMContentLoaded", async () => {
    const user = DataStore.getCurrentUser();
    if (!user) { window.location.href = "login.html"; return; }
    const profile = await DataStore.getProfile();
    document.getElementById("profileName").value = profile?.fullName || profile?.name || "";
    document.getElementById("profileEmail").value = profile?.email || "";
    document.getElementById("profilePhone").value = profile?.phone || "";
    document.getElementById("profileAddress").value = profile?.address || "";
    document.getElementById("profileForm").addEventListener("submit", saveProfile);
});

async function saveProfile(event) {
    event.preventDefault();
    const message = document.getElementById("profileMessage");
    try {
        const profile = await DataStore.updateProfile({
            fullName: document.getElementById("profileName").value.trim(),
            email: document.getElementById("profileEmail").value.trim(),
            phone: document.getElementById("profilePhone").value.trim(),
            address: document.getElementById("profileAddress").value.trim()
        });
        const current = DataStore.getCurrentUser();
        DataStore.setCurrentUser({ ...current, name: profile.fullName, fullName: profile.fullName, email: profile.email, phone: profile.phone, address: profile.address });
        message.className = "text-sm text-green-600";
        message.innerText = "Đã cập nhật thông tin cá nhân.";
    } catch (error) {
        message.className = "text-sm text-red-600";
        message.innerText = error.message;
    }
}