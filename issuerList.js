document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("issuerTableBody");
    const searchInput = document.getElementById("searchInput");
    const fromDateInput = document.getElementById("fromDate");
    const toDateInput = document.getElementById("toDate");
    const applyFiltersBtn = document.getElementById("applyFilters");
    const clearFiltersBtn = document.getElementById("clearFilters");

    let issuers = JSON.parse(localStorage.getItem("issuers")) || [];
    let currentPage = 1;
    const rowsPerPage = 1;

    // ✅ Initialize Flatpickr for date fields
    flatpickr("#fromDate", {
        dateFormat: "d-m-Y",
        maxDate: "today",
        allowInput: true
    });
    flatpickr("#toDate", {
        dateFormat: "d-m-Y",
        maxDate: "today",
        allowInput: true
    });

    // ✅ Parse "dd-mm-yyyy" to Date object (time stripped)
    function parseDMY(dateStr) {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    // ✅ Filter issuers by search + date range
    function filterIssuers(data) {
        const query = searchInput.value.trim().toLowerCase();
        const fromDate = parseDMY(fromDateInput.value);
        const toDate = parseDMY(toDateInput.value);

        return data.filter((issuer) => {
            const text = (
                `${issuer.id} ${issuer.organizationName} ${issuer.postalAddress} 
                 ${issuer.primaryContact.firstName} ${issuer.primaryContact.lastName} 
                 ${issuer.primaryContact.email} ${issuer.primaryContact.phone} ${issuer.website}`
            ).toLowerCase();

            const createdDate = new Date(issuer.createdAt);
            createdDate.setHours(0, 0, 0, 0);

            let dateValid = true;
            if (fromDate && createdDate < fromDate) dateValid = false;
            if (toDate && createdDate > toDate) dateValid = false;

            return text.includes(query) && dateValid;
        });
    }

    // ✅ Render table (dynamic row generation)
    function renderTable(data) {
        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-muted text-center">No issuers found</td></tr>`;
            return;
        }

        data.forEach((issuer) => {
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
                </tr>`;
            tbody.insertAdjacentHTML("beforeend", row);
        });
    }

    // ✅ Render pagination buttons
    function renderPagination(data) {
        const paginationDiv = document.getElementById("pagination");
        if (!paginationDiv) return;

        paginationDiv.innerHTML = "";

        const totalPages = Math.ceil(data.length / rowsPerPage);
        for (let i = 1; i <= totalPages; i++) {
            const btn = `<button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'} me-1 page-btn" data-page="${i}">${i}</button>`;
            paginationDiv.insertAdjacentHTML("beforeend", btn);
        }
    }

    // ✅ Main update logic
    function updateTable() {
        const filtered = filterIssuers(issuers);
        const isFiltered = searchInput.value.trim() || fromDateInput.value || toDateInput.value;

        let dataToRender;
        if (isFiltered) {
            // Show all results on single page when filters are active
            dataToRender = filtered;
            document.getElementById("pagination").innerHTML = "";
        } else {
            // Paginate normally when no filters applied
            const start = (currentPage - 1) * rowsPerPage;
            const paginated = filtered.slice(start, start + rowsPerPage);
            dataToRender = paginated;
            renderPagination(filtered);
        }

        renderTable(dataToRender);
    }

    // ✅ Pagination click event
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("page-btn")) {
            currentPage = parseInt(e.target.dataset.page);
            updateTable();
        }
    });

    // ✅ Filter actions
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

    searchInput.addEventListener("input", () => {
        currentPage = 1;
        updateTable();
    });

    // ✅ SweetAlert delete logic
    tbody.addEventListener("click", (e) => {
        const row = e.target.closest("tr");
        if (!row) return;
        const issuerId = row.getAttribute("data-id");
        const issuer = issuers.find(i => i.id === issuerId);
        if (!issuer) return;

        if (e.target.classList.contains("delete-btn")) {
            const issuerName = `${issuer.primaryContact.firstName} ${issuer.primaryContact.lastName}`.trim() || "this issuer";

            Swal.fire({
                title: `Are you sure you want to delete ${issuerName}?`,
                text: "This action cannot be undone!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
            }).then((result) => {
                if (result.isConfirmed) {
                    issuers = issuers.filter(i => i.id !== issuerId);
                    localStorage.setItem("issuers", JSON.stringify(issuers));
                    updateTable();

                    Swal.fire({
                        title: "Deleted!",
                        text: `${issuerName} has been deleted successfully.`,
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            });
        }


        if (e.target.classList.contains("edit-issuer")) {
            window.location.href = `issuerForm.html?id=${issuerId}`;
        }

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
                issuer.adminAccounts.map(a => `${a.firstName} ${a.lastName} — <i>${a.email}</i>`).join("<br>");
            new bootstrap.Modal(document.getElementById("issuerViewModal")).show();
        }
    });

    // ✅ Initialize
    updateTable();
});
