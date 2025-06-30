document.getElementById("role").addEventListener("change", (e) => {
    const facultyCodeInput = document.getElementById("facultyCode");
    facultyCodeInput.style.display = e.target.value === "faculty" ? "block" : "none";
    facultyCodeInput.required = e.target.value === "faculty";
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;
    const facultyCode = document.getElementById("facultyCode").value.trim();
    const button = document.querySelector("button");

    if (!name || !email || !password || !role) {
        alert("Please fill in all required fields.");
        return;
    }

    const userData = { name, email, password, role };
    if (role === "faculty") {
        if (!facultyCode) {
            alert("Please enter the faculty code.");
            return;
        }
        userData.facultyCode = facultyCode;
    }

    button.disabled = true;
    button.innerText = "Registering...";

    try {
        const response = await fetch("http://localhost:8080/api/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Registration failed due to server error");
        }

        const result = await response.json();
        sessionStorage.setItem("userId", result.id); 
        sessionStorage.setItem("username", result.name); 
        sessionStorage.setItem("useremail", result.email);
        sessionStorage.setItem("role", result.role); 
        sessionStorage.setItem("isVerified", result.isVerified);

        document.body.style.transition = "opacity 0.5s";
        document.body.style.opacity = "0";
        setTimeout(() => {
            window.location.href = "login.html";
        }, 500);
    } catch (error) {
        console.error("Error:", error);
        alert("Registration failed: " + error.message);
    } finally {
        button.disabled = false;
        button.innerText = "Get Started";
    }
});