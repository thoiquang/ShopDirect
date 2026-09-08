async function renderVirtualCard() {
    document.getElementById("cardForm")?.classList.add("hidden");
    const card = await DataStore.getVirtualCard();
    const preview = document.getElementById("cardPreview");
    if (!card) {
        preview.innerHTML = '<div class="border border-dashed rounded-xl p-8 text-center text-gray-400"><i class="fa-regular fa-credit-card text-3xl mb-2"></i><p>Chưa có thẻ ảo</p></div>';
        return;
    }
    preview.innerHTML = `<div class="shop-virtual-card"><p class="text-xs uppercase tracking-widest text-blue-100">ShopDirect Card</p><p class="text-xl tracking-widest mt-6">**** **** **** ${card.cardNumber.slice(-4)}</p><div class="flex justify-between text-xs mt-5"><span>${card.cardholderName}</span><span>${card.expiry}</span></div></div>`;
}

document.addEventListener("DOMContentLoaded", async () => {
    const user = DataStore.getCurrentUser();
    if (!user) { window.location.href = "login.html"; return; }
    await renderVirtualCard();
});
