from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from io import BytesIO
import numpy as np
from PIL import Image
import pickle
import tensorflow as tf
from keras.models import Model
from keras.layers import Input, Dense, LSTM, Embedding, Dropout, add
from keras.preprocessing.sequence import pad_sequences
from keras.applications.xception import Xception

# === FastAPI setup ===
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # update with frontend origin in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Load assets ===
print("🔄 Loading tokenizer...")
tokenizer = pickle.load(open("app/tokenizer.p", "rb"))
vocab_size = len(tokenizer.word_index) + 1
max_length = 32

print("🔄 Loading Xception...")
xception_model = Xception(include_top=False, pooling="avg")

print("🔄 Defining model...")
def define_model(vocab_size, max_length):
    inputs1 = Input(shape=(2048,), name='input_1')
    fe1 = Dropout(0.5)(inputs1)
    fe2 = Dense(256, activation='relu')(fe1)

    inputs2 = Input(shape=(max_length,), name='input_2')
    se1 = Embedding(vocab_size, 256, mask_zero=True)(inputs2)
    se2 = Dropout(0.5)(se1)
    se3 = LSTM(256)(se2)

    decoder1 = add([fe2, se3])
    decoder2 = Dense(256, activation='relu')(decoder1)
    outputs = Dense(vocab_size, activation='softmax')(decoder2)

    model = Model(inputs=[inputs1, inputs2], outputs=outputs)
    model.compile(loss='categorical_crossentropy', optimizer='adam')
    return model

model = define_model(vocab_size, max_length)
model.load_weights("app/model_7.h5")
print("✅ model_7.h5 weights loaded")

# === Core captioning logic ===
def extract_features(image_bytes):
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image = image.resize((299, 299))
    image = np.array(image) / 127.5 - 1.0
    image = np.expand_dims(image, axis=0)
    return xception_model.predict(image)

def word_for_id(integer, tokenizer):
    for word, index in tokenizer.word_index.items():
        if index == integer:
            return word
    return None

def generate_caption(photo, tokenizer, max_length):
    in_text = 'start'
    for _ in range(max_length):
        sequence = tokenizer.texts_to_sequences([in_text])[0]
        sequence = pad_sequences([sequence], maxlen=max_length)
        yhat = model.predict([photo, sequence], verbose=0)
        yhat = np.argmax(yhat)
        word = word_for_id(yhat, tokenizer)
        if word is None:
            break
        in_text += ' ' + word
        if word == 'end':
            break
    return in_text.replace('start', '').replace('end', '').strip()

# === API endpoint ===
@app.post("/caption")
async def caption_image(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        photo = extract_features(image_bytes)
        caption = generate_caption(photo, tokenizer, max_length)
        return JSONResponse(content={"caption": caption})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
