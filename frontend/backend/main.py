from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv
import genai
from fastapi.responses import JSONResponse

load_dotenv()

app = FastAPI()

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. Restrict in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")

@app.post("/api/chat")
async def chat(request: Request):
    data = await request.json()
    user_message = data.get("message")
    payload = {
        "contents": [{"parts": [{"text": user_message}]}]
    }
    response = requests.post(
        f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
        json=payload
    )
    return response.json()

@app.post("/api/llm-recommendation")
async def llm_recommendation(request: Request):
    data = await request.json()
    context = data.get("context")  # e.g., inventory, prices, patient info, etc.
    question = data.get("question")  # e.g., "What are your recommendations?"

    prompt = f"Based on the following data:\n{context}\n\nQuestion: {question}"

    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        return {"recommendation": response.text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"recommendation": f"Error: {str(e)}"}) 