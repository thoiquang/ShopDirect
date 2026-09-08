const WALLET_BALANCES_KEY = "shop_wallet_balances";

function getWalletBalances() {
    return JSON.parse(localStorage.getItem(WALLET_BALANCES_KEY) || "{}");
}

function formatWalletAmount(amount) {
    return `${Number(amount || 0).toLocaleString("vi-VN")} đ`;
}

function getWalletUser() {
    const user = DataStore.getCurrentUser();
    if (!user) {
        window.location.href = "login.html";
        return null;
    }
    return user;
}

function renderWallet() {
    const user = getWalletUser();
    if (!user) return;

    const balances = getWalletBalances();
    document.getElementById("walletBalance").innerText = formatWalletAmount(balances[user.userId]);

    const history = JSON.parse(localStorage.getItem(`shop_wallet_history_${user.userId}`) || "[]");
    const list = document.getElementById("topupList");
    if (!history.length) {
        list.innerHTML = '<p class="text-sm text-gray-400 border border-dashed rounded-xl p-8 text-center">Chưa có giao dịch nạp nào.</p>';
        return;
    }

    list.innerHTML = history.slice().reverse().map(item => {
        return `<article class="border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"><div><p class="font-bold text-slate-800">+ ${formatWalletAmount(item.amount)}</p><p class="text-xs text-gray-500 mt-1">${new Date(item.createdAt).toLocaleString("vi-VN")}${item.note ? ` · ${item.note}` : ""}</p></div><span class="text-green-700 bg-green-50 text-xs font-bold px-2.5 py-1 rounded-full">Đã cộng</span></article>`;
    }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
    if (!getWalletUser()) return;
    renderWallet();
    document.getElementById("topupForm").addEventListener("submit", event => {
        event.preventDefault();
        const user = DataStore.getCurrentUser();
        const amount = Number(document.getElementById("topupAmount").value);
        const note = document.getElementById("topupNote").value.trim();
        const message = document.getElementById("topupMessage");
        if (!Number.isFinite(amount) || amount < 10000) {
            message.className = "text-sm mt-4 text-red-600";
            message.innerText = "Số tiền tối thiểu là 10.000 đ.";
            return;
        }

        const balances = getWalletBalances();
        balances[user.userId] = Number(balances[user.userId] || 0) + amount;
        localStorage.setItem(WALLET_BALANCES_KEY, JSON.stringify(balances));
        const historyKey = `shop_wallet_history_${user.userId}`;
        const history = JSON.parse(localStorage.getItem(historyKey) || "[]");
        history.push({ amount, note, createdAt: new Date().toISOString() });
        localStorage.setItem(historyKey, JSON.stringify(history));
        event.target.reset();
        message.className = "text-sm mt-4 text-green-700";
        message.innerText = "Đã nạp tiền vào ví mô phỏng thành công.";
        renderWallet();
    });
});
