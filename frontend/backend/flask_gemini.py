from flask import Flask, jsonify, request
import google.generativeai as genai
import os
from flask_cors import CORS

# Set API Key
API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")  # Use env var for safety
if API_KEY == "YOUR_GEMINI_API_KEY":
    API_KEY = "IzaSyBDRFaZq5irtup7dD39E5eCOj2VennudqQ"  # fallback to provided key

genai.configure(api_key=API_KEY)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

@app.route("/api/generate", methods=["POST"])
def generate_api():
    try:
        req_body = request.get_json()
        prompt = req_body.get("contents")

        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)

        return jsonify({"response": response.text})

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/api/generate-bard", methods=["POST"])
def generate_bard_api():
    try:
        req_body = request.get_json()
        prompt = req_body.get("contents")
        # Mock Bard response for demonstration
        response_text = f"[Bard LLM] You asked: {prompt}"
        return jsonify({"response": response_text})
    except Exception as e:
        return jsonify({"error": str(e)})

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True) 