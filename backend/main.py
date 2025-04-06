
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import nltk
from nltk.corpus import wordnet as wn, stopwords, words
import requests

nltk.download("stopwords")
nltk.download("wordnet")
nltk.download("words")

app = FastAPI()
valid_words = set(words.words())
stop_words = set(stopwords.words("english"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextRequest(BaseModel):
    text: str

@app.post("/simplify")
def simplify_text(req: TextRequest):
    tokens = req.text.split()
    simplified_tokens = []

    for word in tokens:
        if len(word) > 5 and word.lower() not in stop_words:
            synonyms = get_synonyms(word)
            if synonyms:
                simple_word = min(synonyms, key=len)
                simplified_tokens.append(simple_word)
            else:
                simplified_tokens.append(word)
        else:
            simplified_tokens.append(word)
    
    return {"original": tokens, "simplified": simplified_tokens}

@app.get("/pictogram/{word}")
def pictogram(word: str):
    url = f"https://api.arasaac.org/api/pictograms/en/search/{word}"
    try:
        response = requests.get(url)
        data = response.json()
        if not data:
            raise ValueError("No pictogram found")
        pictogram_id = data[0]["_id"]
        image_url = f"https://static.arasaac.org/pictograms/{pictogram_id}/{pictogram_id}_500.png"
        return {"word": word, "image_url": image_url}
    except Exception:
        return {"word": word, "image_url": None}

def get_synonyms(word):
    synonyms = set()
    for syn in wn.synsets(word):
        for lemma in syn.lemmas():
            synonym = lemma.name().replace("_", " ")
            if synonym in valid_words and len(synonym) >= 4:
                synonyms.add(synonym)
    return synonyms
