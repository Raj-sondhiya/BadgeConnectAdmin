document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("issuerTableBody");
    let issuers = JSON.parse(localStorage.getItem("issuers")) || [];

    function renderTable() {
        tbody.innerHTML = ""; // ✅ Reset body

        if (issuers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-muted">No issuers found</td></tr>`;
            return;
        }

        issuers.forEach((issuer) => {
            const contactPerson = `${issuer.primaryContact.firstName} ${issuer.primaryContact.lastName}`.trim();
            const createdDate = new Date(issuer.createdAt).toLocaleString("en-IN");

            const row = `
                <tr data-id="${issuer.id}">
                    <td>${issuer.id}</td>
                    <td>${issuer.organizationName || '-'}</td>
                    <td>${issuer.postalAddress || '-'}</td>
                    <td>${contactPerson || '-'}</td>
                    <td>${issuer.primaryContact.email || '-'}</td>
                    <td>${issuer.primaryContact.phone || '-'}</td>
                    <td>${issuer.website || '-'}</td>
                    <td>${createdDate}</td>
                   <td class="action-icons">
                        <i class="fa-solid fa-pen-to-square text-warning edit-issuer" data-id="${issuer.id}" title="Edit"></i>
                        <i class="fa-solid fa-trash text-danger delete-btn" data-id="${issuer.id}" title="Delete"></i>
                        <i class="fa-solid fa-eye text-primary view-issuer" data-id="${issuer.id}" title="View"></i>
                    </td>
                </tr>
            `;

            tbody.insertAdjacentHTML("beforeend", row);
        });
    }

    // ✅ Initial Load
    renderTable();

    // ✅ Handle Delete Click (Event Delegation)
    tbody.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const row = e.target.closest("tr");
            const issuerId = row.getAttribute("data-id");

            if (!issuerId) return;

            if (confirm(`Are you sure you want to delete Issuer ID ${issuerId}?`)) {
                issuers = issuers.filter(i => i.id !== issuerId);
                localStorage.setItem("issuers", JSON.stringify(issuers));
                row.remove();
            }
        }
    });
});


// View issuer full details popup

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", function (e) {
        if (!e.target.classList.contains("view-issuer")) return;

        const issuerId = e.target.getAttribute("data-id");
        const issuers = JSON.parse(localStorage.getItem("issuers")) || [];

        const issuer = issuers.find(i => i.id === issuerId);
        if (!issuer) return;

        // Populate Data
        document.getElementById("v-id").textContent = issuer.id;
        document.getElementById("v-orgName").textContent = issuer.organizationName;
        document.getElementById("v-orgEmail").textContent = issuer.organizationEmail;
        document.getElementById("v-address").textContent = issuer.postalAddress;

        const primary = issuer.primaryContact;
        if (primary) {
            document.getElementById("v-primaryName").textContent =
                primary.firstName + " " + primary.lastName;
            document.getElementById("v-primaryEmail").textContent = primary.email;
            document.getElementById("v-primaryPhone").textContent = primary.phone;
        }

        document.getElementById("v-supportEmail").textContent = issuer.supportEmail;
        document.getElementById("v-website").textContent = issuer.website;

        // Admin Accounts List
        document.getElementById("v-adminAccounts").innerHTML = issuer.adminAccounts
            .map(a => `${a.firstName} ${a.lastName} — <i>${a.email}</i>`)
            .join("<br>");

        // Show Bootstrap Modal
        const modal = new bootstrap.Modal(document.getElementById("issuerViewModal"));
        modal.show();
    });
});

