// Map topics to their CSV file paths
const topicToCSV = {
    "AI/ML": "ai_ml_basic_questions.csv",
    "HR": "updated_interview_qa.csv",
    "Python": "python_qa.csv",
    "MERN": "MERN_Stack_Interview_Questions.csv",
    "Java": "java_final_questions_dataset.csv"
  };

  $(document).ready(function() {
    $('#topicSelect').select2({
      placeholder: "Select topics",
      allowClear: true,
      width: '100%' // Match container width
    });
  });
  
  document.getElementById("generateQuizBtn").addEventListener("click", generateQuiz);
  document.getElementById("viewQuizListBtn").addEventListener("click", () => {
    window.location.href = "quiz-list.html"; // Redirect to quiz list
  });
  
  async function generateQuiz() {
    const selectedTopics = getSelectedTopics();
  
    if (selectedTopics.length === 0) {
      alert("Please select at least one topic.");
      return;
    }
  
    try {
      // Fetch and parse CSVs for selected topics
      const allQuestions = [];
  
      for (const topic of selectedTopics) {
        const filePath = topicToCSV[topic];
        if (!filePath) continue;
  
        const questions = await fetchCSV(filePath);
        allQuestions.push(...questions);
      }
  
      if (allQuestions.length < 10) {
        alert("Not enough questions available for the selected topics.");
        return;
      }
  
      const selectedQuestions = getRandomizedQuestions(allQuestions, 10);
  
      const quizConfig = {
        topics: selectedTopics,
        duration: document.getElementById("quizTimer").value,
        scheduleTime: document.getElementById("quizSchedule").value,
        questions: selectedQuestions
      };
  
      renderQuizPreview(selectedQuestions);
      sendQuizToBackend(quizConfig);
      window.location.href = "quiz-list.html";
    } catch (error) {
      console.error("Error loading questions:", error);
      alert("Failed to load questions: " + error.message);
    }
  }
  
  // Helpers
  
  function getSelectedTopics() {
    return Array.from($('#topicSelect').val()); // Use Select2's value
  }
  
  function getRandomizedQuestions(all, count) {
    return all.sort(() => 0.5 - Math.random()).slice(0, count);
  }
  
  function renderQuizPreview(questions) {
    const preview = document.getElementById("quizPreview");
    preview.innerHTML = "<h3>Selected Quiz Questions:</h3>";
    const list = document.createElement("ol");
  
    questions.forEach(q => {
      const li = document.createElement("li");
      li.textContent = q.question;
      list.appendChild(li);
    });
  
    preview.appendChild(list);
  }
  
  function sendQuizToBackend(config) {
    fetch("http://localhost:8000/api/quiz/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(config)
    })
    .then(res => res.ok ? res.json() : Promise.reject("Failed to create quiz"))
    .then(data => {
      alert(`Quiz scheduled successfully! Quiz ID: ${data.id}`);
    })
    .catch(err => {
      console.error("Error:", err);
      alert("Error scheduling quiz: " + err);
    });
  }
  
  function fetchCSV(filePath) {
    return new Promise((resolve, reject) => {
      Papa.parse(filePath, {
        download: true,
        header: true,
        complete: results => {
          const questions = results.data.map(row => ({
            question: row.Question?.trim(),
            expectedAnswer: row.Answer?.trim() || '',
            tip: row.Tips?.trim() || ''
          })).filter(q => q.question); // Filter out blank ones
          resolve(questions);
        },
        error: err => reject(err)
      });
    });
  }

  function redirectToInterviews() {
    window.location.href = "interviews.html"; // Redirect to interviews.html
}
  
  