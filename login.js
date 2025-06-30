document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value.trim();
    const button = document.querySelector("button");
    const errorMessageDiv = document.getElementById("errorMessage");

    // Clear previous error messages
    errorMessageDiv.innerHTML = "";

    // Validate all fields
    if (!email || !password || !role) {
        errorMessageDiv.innerHTML = `<p>Please enter your email, password, and role.</p>`;
        return;
    }

    button.disabled = true;
    button.innerText = "Logging in...";

    try {
        const response = await fetch("http://localhost:8080/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, role }) // Include role in request
        });

        if (!response.ok) {
            errorMessageDiv.innerHTML = `<p>Incorrect credentials</p>`;
            return;
        }

        const result = await response.json();

        // Store data in sessionStorage
        sessionStorage.setItem("userId", result.id);
        sessionStorage.setItem("username", result.name);
        sessionStorage.setItem("useremail", result.email);
        sessionStorage.setItem("role", result.role);
        sessionStorage.setItem("isVerified", result.isVerified);

        // Smooth redirect
        document.body.style.transition = "opacity 0.5s";
        document.body.style.opacity = "0";
        setTimeout(() => {
            window.location.href = "interviews.html";
        }, 500);
    } catch (error) {
        console.error("Error:", error);
        errorMessageDiv.innerHTML = `<p>Incorrect credentials</p>`;
    } finally {
        button.disabled = false;
        button.innerText = "Login";
    }
});