document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addIssuerForm");
    const issuerIdFromQuery = new URLSearchParams(window.location.search).get("id");
    const heading = document.querySelector(".form-title");
    const actionButtons = document.getElementById("actionButtonsContainer");

    const ISSUER_STORAGE_KEY = "issuers";
    let isEditMode = !!issuerIdFromQuery;
    let issuers = JSON.parse(localStorage.getItem(ISSUER_STORAGE_KEY)) || [];
    let currentIssuerIndex = -1;

    // ✅ Required field list
    const requiredFields = [
        "orgName", "postal", "orgWebsite", "orgEmail",
        "pcFirstName", "pcLastName", "pcEmail", "pcPhone", "supportEmail",
        "admin1FirstName", "admin1LastName", "admin1Email", "admin1OrgName"
    ];

    // ✅ Helper to show inline validation message
    function showError(input, message) {
        input.classList.add("is-invalid");
        let feedback = input.parentElement.querySelector(".invalid-feedback");
        if (!feedback) {
            feedback = document.createElement("div");
            feedback.className = "invalid-feedback";
            feedback.textContent = message;
            input.parentElement.appendChild(feedback);
        }
    }

    // ✅ Helper to clear validation
    function clearError(input) {
        input.classList.remove("is-invalid");
        const feedback = input.parentElement.querySelector(".invalid-feedback");
        if (feedback) feedback.remove();
    }

    // ✅ Initialize validation listeners
    requiredFields.forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener("input", () => clearError(input));
    });

    // ✅ Edit Mode Pre-Fill
    if (isEditMode) {
        heading.innerHTML = `<i class="fa-solid fa-pen-to-square me-2"></i>Edit Issuer`;
        currentIssuerIndex = issuers.findIndex(i => i.id === issuerIdFromQuery);
        if (currentIssuerIndex === -1) {
            Swal.fire({
                icon: "error",
                title: "Issuer not found!",
                confirmButtonColor: "#d33"
            }).then(() => {
                window.location.href = "issuerList.html";
            });
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
            <button type="button" id="cancelBtn" class="btn btn-secondary fw-semibold ms-2">Cancel</button>
            <button type="submit" class="btn btn-warning text-white fw-semibold">Update</button>
        `;

        document.getElementById("cancelBtn").addEventListener("click", () => {
            window.location.href = "issuerList.html";
        });
    } else {
        heading.innerHTML = `<i class="fa-solid fa-user-plus me-2"></i>Add Issuer`;
        actionButtons.innerHTML = `
            <button type="submit" class="btn btn-primary 
             fw-semibold ms-2">Submit</button>
        `;
    }

    // ✅ Tab Navigation
    document.getElementById("nextTabBtn").addEventListener("click", () => {
        new bootstrap.Tab(document.querySelector('#admin-tab')).show();
    });
    document.getElementById("prevTabBtn").addEventListener("click", () => {
        new bootstrap.Tab(document.querySelector('#org-tab')).show();
    });

    // ✅ Form Submit with Validation and SweetAlert
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        let isValid = true;
        requiredFields.forEach(id => {
            const input = document.getElementById(id);
            if (!input.value.trim()) {
                showError(input, "This field is required");
                isValid = false;
            }
        });

        if (!isValid) {
            Swal.fire({
                title: "Incomplete Form!",
                text: "Please fill all required fields before submitting.",
                icon: "warning",
                confirmButtonColor: "#f1c40f"
            });
            return;
        }

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
            Swal.fire({
                title: "Updated!",
                text: "Issuer details updated successfully.",
                icon: "success",
                confirmButtonColor: "#28a745"
            }).then(() => {
                localStorage.setItem(ISSUER_STORAGE_KEY, JSON.stringify(issuers));
                window.location.href = "issuerList.html";
            });
        } else {
            issuers.push(formData);
            Swal.fire({
                title: "Success!",
                text: "Issuer added successfully.",
                icon: "success",
                confirmButtonColor: "#28a745"
            }).then(() => {
                localStorage.setItem(ISSUER_STORAGE_KEY, JSON.stringify(issuers));
                window.location.href = "issuerList.html";
            });
        }
    });

    // ✅ Helper — ID Generator
    function generateIssuerId() {
        let lastId = localStorage.getItem("issuerLastId");
        lastId = lastId ? parseInt(lastId) + 1 : 1;
        localStorage.setItem("issuerLastId", lastId);
        return String(lastId).padStart(3, "0");
    }
});
