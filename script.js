const loginForm = document.getElementById("loginForm");
const otpForm = document.getElementById("otpForm");
const emailField = document.getElementById("email");
const verifyEmail = document.getElementById("verifyEmail");
const formSubtitle = document.getElementById("form-subtitle");
const formDesc = document.getElementById("form-desc");
const resendLink = document.getElementById("resendLink");
const timerText = document.getElementById("timer");
const otpInputs = document.querySelectorAll(".otp-input");

let timer;
let countdown = 60;

// ✅ Handle Send OTP
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = emailField.value.trim();
        if (!email) return alert("Please enter a valid email address!");

        // Hide login form, show OTP form
        loginForm.classList.add("d-none");
        otpForm.classList.remove("d-none");

        // populate verify email
        if (verifyEmail) verifyEmail.value = email;

        // update subtitle/desc only if elements exist
        if (formSubtitle) formSubtitle.textContent = "Please verify your login details";
        if (formDesc) formDesc.textContent = "";

        startTimer(); // ✅ start timer immediately when OTP form becomes visible

        // focus first OTP input for convenience
        if (otpInputs && otpInputs.length) otpInputs[0].focus();
    });
}

// ✅ Auto-focus OTP inputs & keyboard navigation
if (otpInputs && otpInputs.length) {
    otpInputs.forEach((input, index) => {
        // input handler: allow only digits and move forward
        input.addEventListener("input", () => {
            input.value = input.value.replace(/[^0-9]/g, "");

            if (input.value && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        // keydown handler: handle Backspace navigation and left/right arrows
        input.addEventListener("keydown", (event) => {
            if (event.key === "Backspace" && !input.value && index > 0) {
                otpInputs[index - 1].focus();
            } else if (event.key === "ArrowLeft" && index > 0) {
                otpInputs[index - 1].focus();
            } else if (event.key === "ArrowRight" && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });
    });
}

// ✅ Countdown Timer
function startTimer() {
    clearInterval(timer); // stop any previous timer to avoid duplicates
    countdown = 60;

    if (resendLink) {
        resendLink.style.pointerEvents = "none";
        resendLink.style.opacity = "0.6";
    }
    if (timerText) timerText.textContent = `00:60`;

    timer = setInterval(() => {
        countdown--;

        const seconds = countdown < 10 ? "0" + countdown : countdown;
        if (timerText) timerText.textContent = `00:${seconds}`;

        if (countdown <= 0) {
            clearInterval(timer);
            if (resendLink) {
                resendLink.style.pointerEvents = "auto";
                resendLink.style.opacity = "1";
            }
            if (timerText) timerText.textContent = "00:00";
        }
    }, 1000);
}

// ✅ Handle Resend Click
if (resendLink) {
    resendLink.addEventListener("click", () => {
        // check computed style rather than inline style would be more robust,
        // but checking pointerEvents is acceptable with our approach.
        if (resendLink.style.pointerEvents === "auto") {
            alert("A new OTP has been sent!");
            startTimer();
        }
    });
}

// ✅ Handle OTP Verification (Fixed OTP = 123456)
if (otpForm) {
    otpForm.addEventListener("submit", function (e) {
        e.preventDefault();

        let enteredOTP = "";
        otpInputs.forEach(input => enteredOTP += input.value);

        if (enteredOTP.length < 6) {
            alert("Please enter all 6 digits of the OTP.");
            return;
        }

        if (enteredOTP === "123456") {
            // Successful login (for demo) -> redirect
            window.location.href = "adminHome.html";
        } else {
            alert("Invalid OTP. Please try again.");
            // optionally clear inputs and focus first
            otpInputs.forEach(inp => inp.value = "");
            if (otpInputs.length) otpInputs[0].focus();
        }
    });
}

// Logout button functionality (if present on page)
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "adminLogin.html";
        }
    });
}


// ✅ Load Navbar into #navbar-placeholder if present
function loadNavbar() {
    const navbarPlaceholder = document.getElementById("navbar-placeholder");
    if (!navbarPlaceholder) return;

    fetch("navbar.html")
        .then(res => res.text())
        .then(html => {
            navbarPlaceholder.innerHTML = html;
        })
        .catch(err => console.error("Navbar load failed:", err));
}

// ✅ Load Footer into #footer-placeholder if present
function loadFooter() {
    const footerPlaceholder = document.getElementById("footer-placeholder");
    if (!footerPlaceholder) return;

    fetch("footer.html")
        .then(res => res.text())
        .then(html => {
            footerPlaceholder.innerHTML = html;
        })
        .catch(err => console.error("Footer load failed:", err));
}

// ✅ Auto-load where placeholders exist
document.addEventListener("DOMContentLoaded", () => {
    loadNavbar();
    loadFooter();
});
