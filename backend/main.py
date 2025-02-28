from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, AutoModelForSequenceClassification
import torch

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="AI Methods Explorer")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define data models
class TextInput(BaseModel):
    text: str

# Load summarization model
tokenizer1 = AutoTokenizer.from_pretrained("facebook/bart-large-cnn")
model1 = AutoModelForSeq2SeqLM.from_pretrained("facebook/bart-large-cnn")

# Load sentiment analysis model
tokenizer2 = AutoTokenizer.from_pretrained("tabularisai/multilingual-sentiment-analysis")
model2 = AutoModelForSequenceClassification.from_pretrained("tabularisai/multilingual-sentiment-analysis")

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "AI Methods Explorer API"}

# Summarization API
@app.post("/api/summarize")
async def summarize_text(input_data: TextInput):
    try:
        inputs = tokenizer1(input_data.text, return_tensors="pt", max_length=1024, truncation=True)
        summary_ids = model1.generate(**inputs, max_length=100, num_beams=4, early_stopping=True)
        summary = tokenizer1.decode(summary_ids[0], skip_special_tokens=True)

        return {"summary": summary}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Sentiment Analysis API
@app.post("/api/sentiment")
async def analyze_sentiment(input_data: TextInput):
    try:
        inputs = tokenizer2(input_data.text, return_tensors="pt", truncation=True)
        outputs = model2(**inputs)
        scores = outputs.logits.softmax(dim=1).tolist()[0]  # Convert logits to probabilities
        labels = ["negative", "neutral", "positive"]

        if not scores:
            raise HTTPException(status_code=500, detail="Error processing sentiment analysis")

        sentiment = labels[scores.index(max(scores))]  # Find highest confidence label

        return {"sentiment": sentiment, "confidence": max(scores)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
