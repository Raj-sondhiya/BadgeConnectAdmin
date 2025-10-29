document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("issuerTableBody");
    const searchInput = document.getElementById("searchInput");
    const fromDateInput = document.getElementById("fromDate");
    const toDateInput = document.getElementById("toDate");

    const applyFiltersBtn = document.getElementById("applyFilters");
    const clearFiltersBtn = document.getElementById("clearFilters");

    let issuers = JSON.parse(localStorage.getItem("issuers")) || [];

    // Pagination State
    let currentPage = 1;
    const rowsPerPage = 1; // Change to 20 later as per note in HTML

    // ✅ Main function to filter + paginate + render
    function updateTable() {
        let filtered = filterIssuers(issuers);
        renderTable(filtered);
        renderPagination(filtered);
    }

    // ✅ Filter Logic for Search + Date + Pagination
    function filterIssuers(data) {
        const query = searchInput.value.trim().toLowerCase();
        const fromDate = fromDateInput.value ? new Date(fromDateInput.value) : null;
        const toDate = toDateInput.value ? new Date(toDateInput.value) : null;

        return data.filter((issuer) => {
            const text =
                `${issuer.id} ${issuer.organizationName} ${issuer.postalAddress} 
                 ${issuer.primaryContact.firstName} ${issuer.primaryContact.lastName} 
                 ${issuer.primaryContact.email} ${issuer.primaryContact.phone} ${issuer.website}`
                    .toLowerCase();

            const createdDate = new Date(issuer.createdAt);

            let dateValid = true;
            if (fromDate && createdDate < fromDate) dateValid = false;
            if (toDate && createdDate > toDate) dateValid = false;

            return text.includes(query) && dateValid;
        });
    }

    // ✅ Render Table
    function renderTable(data) {
        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-muted text-center">No issuers found</td></tr>`;
            return;
        }

        const start = (currentPage - 1) * rowsPerPage;
        const paginated = data.slice(start, start + rowsPerPage);

        paginated.forEach((issuer) => {
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
                        <i class="fa-solid fa-pen-to-square text-warning edit-issuer" title="Edit"></i>
                        <i class="fa-solid fa-trash text-danger delete-btn" title="Delete"></i>
                        <i class="fa-solid fa-eye text-primary view-issuer" title="View"></i>
                    </td>
                </tr>
            `;

            tbody.insertAdjacentHTML("beforeend", row);
        });
    }

    // ✅ Pagination Rendering
    function renderPagination(data) {
        const totalPages = Math.ceil(data.length / rowsPerPage);
        const paginationDiv = document.getElementById("pagination");
        if (!paginationDiv) return;

        paginationDiv.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            const btn = `<button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'} me-1 page-btn" data-page="${i}">${i}</button>`;
            paginationDiv.insertAdjacentHTML("beforeend", btn);
        }
    }

    // ✅ Pagination Click Handler
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("page-btn")) {
            currentPage = parseInt(e.target.dataset.page);
            updateTable();
        }
    });

    // ✅ Apply + Reset filter listeners
    applyFiltersBtn.addEventListener("click", () => {
        currentPage = 1;
        updateTable();
    });

    clearFiltersBtn.addEventListener("click", () => {
        searchInput.value = "";
        fromDateInput.value = "";
        toDateInput.value = "";
        currentPage = 1;
        updateTable();
    });

    // ✅ Search instant typing
    searchInput.addEventListener("input", () => {
        currentPage = 1;
        updateTable();
    });

    // ✅ Event Delegation for Edit/Delete/View
    tbody.addEventListener("click", (e) => {
        const row = e.target.closest("tr");
        if (!row) return;

        const issuerId = row.getAttribute("data-id");
        const issuer = issuers.find(i => i.id === issuerId);

        if (!issuer) return;

        // ✅ Delete
        if (e.target.classList.contains("delete-btn")) {
            if (confirm(`Delete Issuer ID ${issuerId}?`)) {
                issuers = issuers.filter(i => i.id !== issuerId);
                localStorage.setItem("issuers", JSON.stringify(issuers));
                updateTable();
            }
        }

        // ✅ Edit
        if (e.target.classList.contains("edit-issuer")) {
            window.location.href = `issuerForm.html?id=${issuerId}`;
        }

        // ✅ View
        if (e.target.classList.contains("view-issuer")) {
            document.getElementById("v-id").textContent = issuer.id;
            document.getElementById("v-orgName").textContent = issuer.organizationName;
            document.getElementById("v-orgEmail").textContent = issuer.organizationEmail;
            document.getElementById("v-address").textContent = issuer.postalAddress;

            const primary = issuer.primaryContact;
            document.getElementById("v-primaryName").textContent = `${primary.firstName} ${primary.lastName}`;
            document.getElementById("v-primaryEmail").textContent = primary.email;
            document.getElementById("v-primaryPhone").textContent = primary.phone;

            document.getElementById("v-supportEmail").textContent = issuer.supportEmail;
            document.getElementById("v-website").textContent = issuer.website;

            document.getElementById("v-adminAccounts").innerHTML =
                issuer.adminAccounts.map(a =>
                    `${a.firstName} ${a.lastName} — <i>${a.email}</i>`
                ).join("<br>");

            new bootstrap.Modal(document.getElementById("issuerViewModal")).show();
        }
    });

    // ✅ Initial render
    updateTable();
});
