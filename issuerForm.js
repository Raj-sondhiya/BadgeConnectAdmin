document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("addIssuerForm");

    const issuerIdFromQuery = new URLSearchParams(window.location.search).get("id");
    const heading = document.querySelector(".form-title");
    const actionButtons = document.getElementById("actionButtonsContainer");

    const ISSUER_STORAGE_KEY = "issuers";

    let isEditMode = !!issuerIdFromQuery;
    let issuers = JSON.parse(localStorage.getItem(ISSUER_STORAGE_KEY)) || [];
    let currentIssuerIndex = -1;

    if (isEditMode) {
        heading.innerHTML = `<i class="fa-solid fa-pen-to-square me-2"></i>Edit Issuer`;

        currentIssuerIndex = issuers.findIndex(i => i.id === issuerIdFromQuery);
        if (currentIssuerIndex === -1) {
            alert("Issuer not found!");
            window.location.href = "issuerList.html";
            return;
        }

        const issuer = issuers[currentIssuerIndex];
        document.getElementById("orgName").value = issuer.organizationName;
        document.getElementById("postal").value = issuer.postalAddress;
        document.getElementById("orgWebsite").value = issuer.website;
        document.getElementById("orgEmail").value = issuer.organizationEmail;

        document.getElementById("pcFirstName").value = issuer.primaryContact.firstName;
        document.getElementById("pcLastName").value = issuer.primaryContact.lastName;
        document.getElementById("pcEmail").value = issuer.primaryContact.email;
        document.getElementById("pcPhone").value = issuer.primaryContact.phone;

        document.getElementById("supportEmail").value = issuer.supportEmail;

        issuer.adminAccounts.forEach((admin, idx) => {
            document.getElementById(`admin${idx + 1}FirstName`).value = admin.firstName || "";
            document.getElementById(`admin${idx + 1}LastName`).value = admin.lastName || "";
            document.getElementById(`admin${idx + 1}Email`).value = admin.email || "";
            document.getElementById(`admin${idx + 1}OrgName`).value = admin[`admin${idx + 1}OrgName`] || "";
        });

        actionButtons.innerHTML = `
            <button type="button" id="cancelBtn" class="btn btn-secondary fw-semibold">
                Cancel
            </button>
            <button type="submit" class="btn btn-warning text-white fw-semibold">
                Update
            </button>
        `;

        document.getElementById("cancelBtn").addEventListener("click", () => {
            window.location.href = "issuerList.html";
        });

    } else {
        heading.innerHTML = `<i class="fa-solid fa-user-plus me-2"></i>Add Issuer`;
        actionButtons.innerHTML = `
            <button type="submit" class="btn btn-success fw-semibold">
                Submit
            </button>
        `;
    }

    // ✅ Tab navigation buttons
    const nextBtn = document.getElementById("nextTabBtn");
    const prevBtn = document.getElementById("prevTabBtn");

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            const adminTab = document.querySelector('#admin-tab');
            const tab = new bootstrap.Tab(adminTab);
            tab.show();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            const orgTab = document.querySelector('#org-tab');
            const tab = new bootstrap.Tab(orgTab);
            tab.show();
        });
    }



    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = {
            id: isEditMode ? issuerIdFromQuery : generateIssuerId(),
            organizationName: document.getElementById("orgName").value.trim(),
            postalAddress: document.getElementById("postal").value.trim(),
            website: document.getElementById("orgWebsite").value.trim(),
            organizationEmail: document.getElementById("orgEmail").value.trim(),
            primaryContact: {
                firstName: document.getElementById("pcFirstName").value.trim(),
                lastName: document.getElementById("pcLastName").value.trim(),
                email: document.getElementById("pcEmail").value.trim(),
                phone: document.getElementById("pcPhone").value.trim(),
            },
            supportEmail: document.getElementById("supportEmail").value.trim(),
            adminAccounts: [
                {
                    firstName: document.getElementById("admin1FirstName").value.trim(),
                    lastName: document.getElementById("admin1LastName").value.trim(),
                    email: document.getElementById("admin1Email").value.trim(),
                    admin1OrgName: document.getElementById("admin1OrgName").value.trim(),
                },
                {
                    firstName: document.getElementById("admin2FirstName").value.trim(),
                    lastName: document.getElementById("admin2LastName").value.trim(),
                    email: document.getElementById("admin2Email").value.trim(),
                    admin2OrgName: document.getElementById("admin2OrgName").value.trim(),
                },
                {
                    firstName: document.getElementById("admin3FirstName").value.trim(),
                    lastName: document.getElementById("admin3LastName").value.trim(),
                    email: document.getElementById("admin3Email").value.trim(),
                    admin3OrgName: document.getElementById("admin3OrgName").value.trim(),
                }
            ],
            createdAt: new Date().toISOString()
        };

        if (isEditMode) {
            issuers[currentIssuerIndex] = formData;
            alert("Issuer updated successfully ✅");
        } else {
            issuers.push(formData);
            alert("Issuer added successfully ✅");
        }

        localStorage.setItem(ISSUER_STORAGE_KEY, JSON.stringify(issuers));
        window.location.href = "issuerList.html";
    });


    function generateIssuerId() {
        let lastId = localStorage.getItem("issuerLastId");
        lastId = lastId ? parseInt(lastId) + 1 : 1;
        localStorage.setItem("issuerLastId", lastId);
        return String(lastId).padStart(3, "0");
    }

});
