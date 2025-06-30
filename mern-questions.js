var apiBaseUrl = "http://localhost:8000"; // Update when deploying

// Load a random question from the backend
async function loadQuestion() {
    try {
        const response = await fetch(`${apiBaseUrl}/question3`);
        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        document.getElementById("question").innerText = data.question;
        document.getElementById("feedback").innerText = "";
        document.getElementById("answer").value = "";
        document.getElementById("nextQuestionOptions").style.display = "none";
        document.getElementById("tips").innerText = ""; // Clear the tip when loading a new question


        // Store the expected answer for evaluation
        localStorage.setItem("expectedAnswer", data.answer);
    } catch (error) {
        console.error("Error loading question:", error);
        alert("Failed to load question. Please try again.");
    }
}

// Submit answer and get feedback
async function submitAnswer() {
    const userAnswer = document.getElementById("answer").value.trim();
    const expectedAnswer = localStorage.getItem("expectedAnswer");
    const validationMessage = document.getElementById('validationMessage');

    if (!userAnswer) {
        validationMessage.textContent = "Please enter an answer before submitting.";
        validationMessage.style.display = "block";
        return;
    }

    validationMessage.style.display = "none";

    try {
        const response = await fetch(`${apiBaseUrl}/evaluate3/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_answer: userAnswer, expected_answer: expectedAnswer }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        document.getElementById("feedback").innerText = data.feedback;
        document.getElementById("tips").innerText = "Tip: " + data.tip;
        document.getElementById("nextQuestionOptions").style.display = "block";
    } catch (error) {
        console.error("Error submitting answer:", error);
        alert("Failed to submit answer. Please try again.");
    }
}


// Load the first question when the page loads
window.onload = function () {
    loadQuestion();

    // Hide validation message when user starts typing
    document.getElementById("answer").addEventListener("input", function () {
        document.getElementById("validationMessage").style.display = "none";
    });
};
