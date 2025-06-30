let quizData = null;
let quizDuration = 15; // Default duration in minutes
let timerInterval;
let isSubmitted = false;

function startTimer(duration) {
  let time = duration * 60;
  const timerDisplay = document.getElementById("timer");

  timerInterval = setInterval(() => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    if (time === 60) {
      console.warn("Only 1 minute left!");
      timerDisplay.style.color = "red"; // Visual warning
    }

    if (time <= 0) {
      clearInterval(timerInterval);
      alert("Time's up! Submitting your quiz...");
      submitQuiz();
    }

    time--;
  }, 1000);
}


function downloadQuizImage() {
  const quizContainer = document.querySelector(".quiz-container");

  setTimeout(() => {
    html2canvas(quizContainer, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
    }).then(canvas => {
      const imageURL = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = imageURL;
      downloadLink.download = `student-quiz.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }).catch(err => {
      console.error("Error capturing image:", err);
    });
  }, 300); // slight delay to ensure DOM is fully rendered
}


window.addEventListener("load", () => {
  document.getElementById("downloadPage").addEventListener("click", downloadQuizImage);
});



function loadQuiz() {
  const urlParams = new URLSearchParams(window.location.search);
  const quizIdParam = urlParams.get("quizId");
  const quizId = parseInt(quizIdParam, 10);

  const userId = sessionStorage.getItem("userId");

  if (!quizIdParam || isNaN(quizId)) {
    document.getElementById("quizContent").innerHTML = "<p>Invalid quiz selected.</p>";
    return;
  }

  fetch(`http://localhost:8000/api/quiz/${quizId}?userId=${userId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Quiz not found or unavailable.");
      }
      return response.json();
    })
    .then(data => {
      quizData = data;
      console.log("Loaded quiz data:", quizData);

      const content = document.getElementById("quizContent");
      const submitBtn = document.getElementById("submitQuizBtn");

      if (quizData.status === "Scheduled") {
        content.innerHTML = `<p>Quiz is scheduled for ${new Date(quizData.scheduleTime).toLocaleString()}. Please check back later.</p>`;
        submitBtn.disabled = true;
        clearInterval(timerInterval);
        document.getElementById("timer").textContent = "";
      } else if (quizData.status === "Live") {
        quizDuration = quizData.duration;
        displayQuiz(quizData.questions);
        startTimer(quizDuration);
        submitBtn.disabled = false;
        isSubmitted = false;
      } else if (quizData.status === "Completed") {
        content.innerHTML = `<p>Quiz completed. Your score: ${quizData.score ?? "Not Submitted"}.</p>`;
        submitBtn.disabled = true;
        clearInterval(timerInterval);
        document.getElementById("timer").textContent = "Quiz Completed";
        isSubmitted = true; 
      }
    })
    .catch(error => {
      console.error("Error fetching quiz:", error);
      document.getElementById("quizContent").innerHTML = `<p>${error.message}</p>`;
    });
}

function displayQuiz(questions) {
  const container = document.getElementById("quizContent");
  container.innerHTML = "";

  questions.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "question";
    div.innerHTML = `
      <h3>Q${index + 1}: ${q.question}</h3>
      <input 
        type="text" 
        class="answer-input" 
        data-index="${index}" 
        placeholder="Your answer here" 
      />
    `;
    container.appendChild(div);
  });
}

function submitQuiz() {
  clearInterval(timerInterval);

  if (!quizData || !quizData.questions) {
    console.error("Quiz data is not loaded properly.");
    document.getElementById("result").innerHTML = `<p>Error: Quiz data not loaded.</p>`;
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const quizIdParam = urlParams.get("quizId");
  const quizId = parseInt(quizIdParam, 10);
  if (isNaN(quizId)) {
    console.error("Invalid quiz ID");
    return;
  }

  const userId = sessionStorage.getItem("userId");
  
  const inputs = document.querySelectorAll(".answer-input");
  const answers = Array.from(inputs).map((input, idx) => ({
    question: quizData.questions[idx].question,
    expectedAnswer: quizData.questions[idx].expectedAnswer,
    userAnswer: input.value.trim()
  }));
  const payload = {
    userId: userId,
    quizId: quizId,
    answers: answers
  };
  console.log("Submitting answers:", JSON.stringify(payload, null, 2));

  inputs.forEach(input => input.disabled = true);
  const submitBtn = document.getElementById("submitQuizBtn");
  submitBtn.disabled = true;
  isSubmitted = true;

  fetch("http://localhost:8000/api/quiz/evaluate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
  .then(async response => {
    const data = await response.json();
    return data;
  })
  .then(result => {
    
    if (result.message) {
      document.getElementById("result").innerHTML =
        `<p class="glow-text" style="color:red;">${result.message}</p>`;
      return;
    }
      console.log("Evaluation result:", result);
      quizData.status = "Completed"; // Update local quiz data
      quizData.score = result.totalScore;
      quizData.questions = [];

      // Clear questions and show results
      const content = document.getElementById("quizContent");
      content.innerHTML = `<p>This quiz has been completed. Your score: ${result.totalScore}.</p>`;

      const resultDiv = document.getElementById("result");
      resultDiv.innerHTML = `<h2>Your Score: ${result.totalScore}</h2>`;

      if (result.details && result.details.length > 0) {
        result.details.forEach((item, idx) => {
          const detail = document.createElement("div");
          detail.innerHTML = `
            <p><strong>Q${idx + 1}:</strong> ${item.question}</p>
            <p><strong>Your Answer:</strong> ${item.userAnswer}</p>
            <p><strong>Score:</strong> ${item.score}</p>
            <hr />
          `;
          resultDiv.appendChild(detail);
        });
      } else {
        resultDiv.innerHTML += `<p>No detailed evaluation available.</p>`;
      }
      document.getElementById("timer").textContent = "Quiz Completed";
    })
    .catch(error => {
      console.error("Error submitting quiz:", error);
      document.getElementById("result").innerHTML = `<p>There was an error submitting the quiz.</p>`;
      if (!isSubmitted) {
        submitBtn.disabled = false;
        inputs.forEach(input => input.disabled = false);
      }
    });
}

document.getElementById("submitQuizBtn").addEventListener("click", function(event) {
  event.preventDefault();
  submitQuiz();
});

document.getElementById("backToQuizListBtn").addEventListener("click", () => {
  window.location.href = "quiz-list.html";
});

window.onload = loadQuiz;