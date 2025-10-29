document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("addIssuerForm");
    const nextBtn = document.getElementById("nextTabBtn");
    const prevBtn = document.getElementById("prevTabBtn");
    const orgTabBtn = document.getElementById("org-tab");
    const adminTabBtn = document.getElementById("admin-tab");

    // ✅ Show Admin tab on Next
    nextBtn.addEventListener("click", () => {
        adminTabBtn.click();
    });

    // ✅ Show Org tab on Previous
    prevBtn.addEventListener("click", () => {
        orgTabBtn.click();
    });

    // ✅ Submit Handler
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // ✅ Generate Unique 3-Digit Issuer ID
        let lastId = localStorage.getItem("issuerLastId");
        lastId = lastId ? parseInt(lastId) + 1 : 1;

        if (lastId > 999) {
            alert("Maximum issuer limit reached!");
            return;
        }

        const issuerId = String(lastId).padStart(3, "0");
        localStorage.setItem("issuerLastId", lastId);

        // ✅ Collect form values by unique IDs
        const formData = {
            id: issuerId, // ✅ Added unique ID here
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

        // ✅ Print object in console for verification
        // console.log("🚀 Issuer Form Data:", formData);

        // ✅ Store in array (not overwrite)
        const existingIssuers = JSON.parse(localStorage.getItem("issuers")) || [];
        existingIssuers.push(formData);
        localStorage.setItem("issuers", JSON.stringify(existingIssuers));

        alert(`Issuer ${issuerId} added successfully!✅`);
        window.location.href = "issuerList.html"; // auto reload
    });
});
