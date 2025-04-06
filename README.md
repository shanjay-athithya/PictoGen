
# 🧠 Pictogram Generator Web App

Convert complex sentences into simplified ones and visualize them with pictograms using ARASAAC.

---

## 🚀 Features

- 🔤 Lexical simplification with WordNet
- 🖼️ Pictograms from ARASAAC
- ⚡ React + TailwindCSS + FastAPI
- 📱 Mobile-first design with PWA support
- 🐳 Docker + Docker Compose ready

---

## 🛠️ Local Development

### ▶ Backend (FastAPI)
```bash
cd backend
pip install -r ../requirements.txt
uvicorn main:app --reload
```

### ▶ Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

App runs at: http://localhost:5173  
API runs at: http://localhost:8000

---

## 🐳 Docker Compose

To run both frontend and backend:
```bash
docker-compose up --build
```

---

## 📦 Production Ready

- Fully responsive design
- CORS enabled
- Clean REST API
- Easily extendable

---
Built with ❤️
