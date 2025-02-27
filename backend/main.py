from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

# Initialize FastAPI
app = FastAPI(title="AI Methods Explorer")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust for your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("facebook/bart-large-cnn")
model = AutoModelForSeq2SeqLM.from_pretrained("facebook/bart-large-cnn")

# Define input data model
class TextInput(BaseModel):
    text: str

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "AI Methods Explorer API"}

# Summarization endpoint
@app.post("/api/summarize")
async def summarize_text(input_data: TextInput):
    try:
        # Tokenize input text
        inputs = tokenizer(input_data.text, return_tensors="pt", max_length=1024, truncation=True)

        # Generate summary
        summary_ids = model.generate(
            inputs["input_ids"], 
            max_length=150, 
            min_length=40, 
            length_penalty=2.0, 
            num_beams=4
        )

        # Decode summary
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
