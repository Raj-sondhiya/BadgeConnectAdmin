document.addEventListener("DOMContentLoaded", () => {
    const issuers = JSON.parse(localStorage.getItem("issuers")) || [];

    // ✅ Update total issuers count card
    document.getElementById("totalIssuersCount").textContent = issuers.length;

    // ✅ Render table with "actions column hidden"
    if (typeof renderTable === "function") {
        renderTable({ hideActions: true });
    }
});
