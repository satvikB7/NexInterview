from copy import deepcopy
from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
from fastapi.middleware.cors import CORSMiddleware  
from typing import List
from sklearn.feature_extraction.text import CountVectorizer
import datetime



app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

quizzes = []
quiz_id_counter = 1
user_quiz_attempts = {}

# Load datasets
df_hr = pd.read_csv('updated_interview_qa.csv', encoding='ISO-8859-1')
df_java = pd.read_csv('java_final_questions_dataset.csv', encoding='ISO-8859-1')
df_python = pd.read_csv('python_qa.csv', encoding='ISO-8859-1')
df_mern = pd.read_csv('MERN_Stack_Interview_Questions.csv', encoding='ISO-8859-1')
df_ai_ml = pd.read_csv('ai_ml_basic_questions.csv', encoding='ISO-8859-1')

# Load model
model = SentenceTransformer('all-MiniLM-L6-v2') #similar to bert/vader for sentence embedding

# Tracking scores
performance_scores_java = []
question_numbers_java = []

performance_scores_hr = []
question_numbers_hr = []

performance_scores_python = []
question_numbers_python = []

performance_scores_mern = []
question_numbers_mern = []

performance_scores_ai_ml = []
question_numbers_ai_ml = []

# Input model
class AnswerRequest(BaseModel):
    user_answer: str
    expected_answer: str

@app.get("/")
def home():
    return {"message": "Unified ML Server is Running!"}

# ========================= JAVA Routes =========================
@app.get("/question1")
def fetch_java_question():
    row = df_java.sample(1).iloc[0]
    return {
        "question": row['Question'],
        "answer": row['Answer'],
        "tip": row.get('Tips', "No tip available.")
    }

@app.post("/evaluate1/")
def evaluate_java_answer(request: AnswerRequest):
    user_embedding = model.encode(request.user_answer)
    expected_embedding = model.encode(request.expected_answer)
    similarity = float(cosine_similarity([user_embedding], [expected_embedding])[0][0])
    
    performance_scores_java.append(similarity)
    question_numbers_java.append(len(performance_scores_java))

    tip = df_java[df_java["Answer"] == request.expected_answer]["Tips"].values
    tip_text = tip[0] if len(tip) > 0 else "No tip available."

    if similarity > 0.7:
        feedback = "Good job! Your answer is very close to the expected one."
    elif similarity > 0.5:
        feedback = "Not bad, but there’s room to improve."
    else:
        feedback = "Needs improvement. Try focusing on the key points."

    return {"similarity": similarity, "feedback": feedback, "tip": tip_text}

@app.get("/performance_chart1/")
def java_chart():
    if len(performance_scores_java) < 3:
        return {"message": "Answer at least 3 questions to generate chart."}
    
    plt.figure(figsize=(8, 5))
    plt.plot(question_numbers_java, performance_scores_java, marker='o', color='green', label='Java Score')
    plt.xlabel('Question Number')
    plt.ylabel('Similarity Score')
    plt.title('Java Interview Performance')
    plt.ylim(0, 1)
    plt.legend()
    plt.grid(True)

    img_bytes = io.BytesIO()
    plt.savefig(img_bytes, format='png')
    plt.close()
    img_bytes.seek(0)
    return Response(content=img_bytes.getvalue(), media_type="image/png")

# ========================= HR Routes =========================
@app.get("/question")
def fetch_hr_question():
    row = df_hr.sample(1).iloc[0]
    return {
        "question": row['Question'],
        "answer": row['Answer'],
        "tip": row.get('Tips', "No tip available.")
    }

@app.post("/evaluate/")
def evaluate_hr_answer(request: AnswerRequest):
    user_embedding = model.encode(request.user_answer)
    expected_embedding = model.encode(request.expected_answer)
    similarity = float(cosine_similarity([user_embedding], [expected_embedding])[0][0])
    
    performance_scores_hr.append(similarity)
    question_numbers_hr.append(len(performance_scores_hr))

    tip = df_hr[df_hr["Answer"] == request.expected_answer]["Tips"].values
    tip_text = tip[0] if len(tip) > 0 else "No tip available."

    if similarity > 0.7:
        feedback = "Good job! Your answer is very close to the expected one."
    elif similarity > 0.5:
        feedback = "Not bad, but there’s room to improve."
    else:
        feedback = "Needs improvement. Try focusing on the key points."

    return {"similarity": similarity, "feedback": feedback, "tip": tip_text}

@app.get("/performance_chart/")
def hr_chart():
    if len(performance_scores_hr) < 3:
        return {"message": "Answer at least 3 questions to generate chart."}
    
    plt.figure(figsize=(8, 5))
    plt.plot(question_numbers_hr, performance_scores_hr, marker='o', color='blue', label='HR Score')
    plt.xlabel('Question Number')
    plt.ylabel('Similarity Score')
    plt.title('HR Interview Performance')
    plt.ylim(0, 1)
    plt.legend()
    plt.grid(True)

    img_bytes = io.BytesIO()
    plt.savefig(img_bytes, format='png')
    plt.close()
    img_bytes.seek(0)
    return Response(content=img_bytes.getvalue(), media_type="image/png")

# ========================= PYTHON Routes =========================
@app.get("/question2")
def fetch_python_question():
    row = df_python.sample(1).iloc[0]
    return {
        "question": row['Question'],
        "answer": row['Answer'],
        "tip": row.get('Tips', "No tip available.")
    }

@app.post("/evaluate2/")
def evaluate_python_answer(request: AnswerRequest):
    user_embedding = model.encode(request.user_answer)
    expected_embedding = model.encode(request.expected_answer)
    similarity = float(cosine_similarity([user_embedding], [expected_embedding])[0][0])
    
    performance_scores_python.append(similarity)
    question_numbers_python.append(len(performance_scores_python))

    tip = df_python[df_python["Answer"] == request.expected_answer]["Tips"].values
    tip_text = tip[0] if len(tip) > 0 else "No tip available."

    if similarity > 0.7:
        feedback = "Great job! Your Python answer is on point."
    elif similarity > 0.5:
        feedback = "Not bad, but you can be more precise."
    else:
        feedback = "Needs improvement. Focus on Python concepts more clearly."

    return {"similarity": similarity, "feedback": feedback, "tip": tip_text}

@app.get("/performance_chart2/")
def python_chart():
    if len(performance_scores_python) < 3:
        return {"message": "Answer at least 3 questions to generate chart."}
    
    plt.figure(figsize=(8, 5))
    plt.plot(question_numbers_python, performance_scores_python, marker='o', color='orange', label='Python Score')
    plt.xlabel('Question Number')
    plt.ylabel('Similarity Score')
    plt.title('Python Interview Performance')
    plt.ylim(0, 1)
    plt.legend()
    plt.grid(True)

    img_bytes = io.BytesIO()
    plt.savefig(img_bytes, format='png')
    plt.close()
    img_bytes.seek(0)
    return Response(content=img_bytes.getvalue(), media_type="image/png")

# ========================= MERN Routes =========================
@app.get("/question3")
def fetch_mern_question():
    row = df_mern.sample(1).iloc[0]
    return {
        "question": row['Question'],
        "answer": row['Answer'],
        "tip": row.get('Tips', "No tip available.")
    }

@app.post("/evaluate3/")
def evaluate_mern_answer(request: AnswerRequest):
    user_embedding = model.encode(request.user_answer)
    expected_embedding = model.encode(request.expected_answer)
    similarity = float(cosine_similarity([user_embedding], [expected_embedding])[0][0])
    
    performance_scores_mern.append(similarity)
    question_numbers_mern.append(len(performance_scores_mern))

    tip = df_mern[df_mern["Answer"] == request.expected_answer]["Tips"].values
    tip_text = tip[0] if len(tip) > 0 else "No tip available."

    if similarity > 0.7:
        feedback = "Nice! That’s a solid MERN answer."
    elif similarity > 0.5:
        feedback = "Okay answer, but could be more detailed."
    else:
        feedback = "Needs more focus on MERN stack concepts."

    return {"similarity": similarity, "feedback": feedback, "tip": tip_text}

@app.get("/performance_chart3/")
def mern_chart():
    if len(performance_scores_mern) < 3:
        return {"message": "Answer at least 3 questions to generate chart."}
    
    plt.figure(figsize=(8, 5))
    plt.plot(question_numbers_mern, performance_scores_mern, marker='o', color='purple', label='MERN Score')
    plt.xlabel('Question Number')
    plt.ylabel('Similarity Score')
    plt.title('MERN Stack Interview Performance')
    plt.ylim(0, 1)
    plt.legend()
    plt.grid(True)

    img_bytes = io.BytesIO()
    plt.savefig(img_bytes, format='png')
    plt.close()
    img_bytes.seek(0)
    return Response(content=img_bytes.getvalue(), media_type="image/png")

# ========================= AI/ML Routes =========================
@app.get("/question4")
def fetch_ai_ml_question():
    row = df_ai_ml.sample(1).iloc[0]
    return {
        "question": row['Question'],
        "answer": row['Answer'],
        "tip": row.get('Tips', "No tip available.")
    }

@app.post("/evaluate4/")
def evaluate_ai_ml_answer(request: AnswerRequest):
    user_embedding = model.encode(request.user_answer)
    expected_embedding = model.encode(request.expected_answer)
    similarity = float(cosine_similarity([user_embedding], [expected_embedding])[0][0])

    performance_scores_ai_ml.append(similarity)
    question_numbers_ai_ml.append(len(performance_scores_ai_ml))

    tip = df_ai_ml[df_ai_ml["Answer"] == request.expected_answer]["Tips"].values
    tip_text = tip[0] if len(tip) > 0 else "No tip available."

    if similarity > 0.7:
        feedback = "Excellent! Your AI/ML response is well aligned."
    elif similarity > 0.5:
        feedback = "Decent try. You can add more technical depth."
    else:
        feedback = "Needs more clarity and precision on AI/ML concepts."

    return {"similarity": similarity, "feedback": feedback, "tip": tip_text}

@app.get("/performance_chart4/")
def ai_ml_chart():
    if len(performance_scores_ai_ml) < 3:
        return {"message": "Answer at least 3 questions to generate chart."}

    plt.figure(figsize=(8, 5))
    plt.plot(question_numbers_ai_ml, performance_scores_ai_ml, marker='o', color='red', label='AI/ML Score')
    plt.xlabel('Question Number')
    plt.ylabel('Similarity Score')
    plt.title('AI/ML Interview Performance')
    plt.ylim(0, 1)
    plt.legend()
    plt.grid(True)

    img_bytes = io.BytesIO()
    plt.savefig(img_bytes, format='png')
    plt.close()
    img_bytes.seek(0)
    return Response(content=img_bytes.getvalue(), media_type="image/png")

# ========================= RESET =========================
@app.get("/reset_performance/")
def reset_performance():
    global performance_scores_hr, question_numbers_hr
    global performance_scores_java, question_numbers_java
    global performance_scores_python, question_numbers_python
    global performance_scores_mern, question_numbers_mern
    global performance_scores_ai_ml, question_numbers_ai_ml
    
    performance_scores_hr.clear()
    question_numbers_hr.clear()
    
    performance_scores_java.clear()
    question_numbers_java.clear()
    
    performance_scores_python.clear()
    question_numbers_python.clear()

    performance_scores_mern.clear()
    question_numbers_mern.clear()

    performance_scores_ai_ml.clear()
    question_numbers_ai_ml.clear()
    
    return {"message": "Performance scores reset successfully."}


# Pydantic models for input
class AnswerItem(BaseModel):
    question: str
    expectedAnswer: str
    userAnswer: str

class AnswersRequest(BaseModel):
    quizId: int
    userId: str 
    answers: List[AnswerItem]

class QuizConfig(BaseModel):
    topics: List[str]
    duration: str 
    scheduleTime: str  
    questions: List[dict]

@app.post("/api/quiz/create")
async def create_quiz(config: QuizConfig):
    global quiz_id_counter
    try:
        duration = int(config.duration)
        schedule_time = datetime.datetime.fromisoformat(config.scheduleTime)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid duration or scheduleTime format")
    
    quiz = {
        "id": quiz_id_counter,
        "topics": config.topics,
        "duration": int(config.duration),
        "scheduleTime": config.scheduleTime,
        "questions": config.questions,
        "status": "Scheduled",
        "score": None
    }
    quizzes.append(quiz)
    quiz_id_counter += 1
    return {"id": quiz["id"], "message": "Quiz scheduled successfully"}


@app.get("/api/quiz/list")
async def list_quizzes(userId: str = None):
    now = datetime.datetime.now().isoformat()
    quizList = []  
    for quiz in quizzes:
        quiz_copy = deepcopy(quiz)
        if quiz_copy["status"] != "Completed":
            schedule_time = quiz_copy["scheduleTime"]
            duration_minutes = quiz_copy["duration"]
            start_time = datetime.datetime.fromisoformat(schedule_time)
            end_time = start_time + datetime.timedelta(minutes=duration_minutes)
            
            if now < schedule_time:
                quiz_copy["status"] = "Scheduled"
            elif schedule_time <= now < end_time.isoformat():
                quiz_copy["status"] = "Live"
            else:
                quiz_copy["status"] = "Completed"
        
        if userId and (quiz_copy["id"], userId) in user_quiz_attempts:
            quiz_copy["status"] = user_quiz_attempts[(quiz_copy["id"], userId)]["status"]
            quiz_copy["score"] = user_quiz_attempts[(quiz_copy["id"], userId)]["score"]
        else:
            quiz_copy["score"] = quiz_copy.get("score", None)
            
        quizList.append(quiz_copy)
    
    return quizList




@app.post("/api/quiz/evaluate")
async def evaluate_quiz(data: AnswersRequest):
    print(f"DEBUG: Hit /api/quiz/evaluate with quizId: {data.quizId}")
    quiz = next((q for q in quizzes if q["id"] == data.quizId), None)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    if (quiz["id"], data.userId) in user_quiz_attempts:
        return {
            "message": "Quiz already submitted",
            "totalScore": user_quiz_attempts[(data.quizId, data.userId)]["score"],
            "details": []
        }


    if not data.answers:
        raise HTTPException(status_code=400, detail="No answers provided")

    result_details = []
    total_score = 0

    for answer in data.answers:
        user_embedding = model.encode(answer.userAnswer)
        expected_embedding = model.encode(answer.expectedAnswer)
        cosine_sim = float(cosine_similarity([user_embedding], [expected_embedding])[0][0])

        if cosine_sim > 0.7:
            score = 2
        elif cosine_sim > 0.3:
            score = 1
        else:
            score = 0

        total_score += score

        result_details.append({
            "question": answer.question,
            "userAnswer": answer.userAnswer,
            "similarity": round(cosine_sim, 2),
            "score": score
        })

    user_quiz_attempts[(data.quizId, data.userId)] = {
        "score": total_score,
        "status": "Completed"
    }

    return {
        "totalScore": total_score,
        "details": result_details
    }



@app.get("/api/quiz/{quiz_id}")
async def get_quiz(quiz_id: int, userId: str = None):
    quiz = next((q for q in quizzes if q["id"] == quiz_id), None)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    quiz_local = deepcopy(quiz)

    if userId and (quiz_id, userId) in user_quiz_attempts:
        quiz_local["status"] = "Completed"
        quiz_local["score"] = user_quiz_attempts[(quiz_id, userId)]["score"]
        quiz_local["questions"] = []
        return quiz_local
    
    schedule_time = datetime.datetime.fromisoformat(quiz_local["scheduleTime"])
    end_time = schedule_time + datetime.timedelta(minutes=quiz_local["duration"])
    now = datetime.datetime.now()
    
    if now < schedule_time:
        quiz_local["status"] = "Scheduled"
    elif schedule_time <= now < end_time:
        quiz_local["status"] = "Live"
    else:
        quiz_local["status"] = "Completed"
        quiz_local["questions"] = []
    
    if userId and (quiz_local["id"], userId) in user_quiz_attempts:
        quiz_local["status"] = user_quiz_attempts[(quiz_local["id"], userId)]["status"]
        quiz_local["score"] = user_quiz_attempts[(quiz_local["id"], userId)]["score"]
    else:
        quiz_local["score"] = quiz_local.get("score", None)
    
    return quiz_local


