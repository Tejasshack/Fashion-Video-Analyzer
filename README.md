# 🎬 Fashion Video Analyzer Ai

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3+-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-yellow?logo=python)](https://www.python.org/)

A **blazing-fast, AI-powered video analyzer** built with **Next.js**, **Tailwind CSS**, and a robust **Python backend**.  
Effortlessly analyze videos for **key frames, object detection, audio transcripts, and AI-generated summaries** in a modern web interface.

---

## Demonstration Video Link


https://drive.google.com/file/d/1ccmQiVECe9AyF_qmmfPBTvi2JnwgxV-K/view?usp=sharing


---

## Reference video i used for analysis



https://github.com/user-attachments/assets/c78f4453-62d7-4135-b39a-57a2245d2eae



https://github.com/user-attachments/assets/4135711c-f74d-4579-a804-8677cc2a4772



## 🚀 Features

- **Drag & Drop Upload:** Instantly upload and analyze any video file in your browser.
- **Key Frame Detection:** Automatically highlights the most important frames.
- **Object Detection:** Fast, accurate recognition using YOLOv8.
- **Audio Transcription:** Converts speech to text with high accuracy.
- **Visual Summary:** Clear, human-readable highlights of key actions and objects.
- **AI Summaries:** Generate concise overviews using Ollama or other LLMs.
- **Responsive UI:** Beautiful, mobile-friendly interface powered by Tailwind CSS.

---

## 📸 Screenshots

<div align="center">
<img width="1918" height="1013" alt="image" src="https://github.com/user-attachments/assets/507c20d9-4b1e-4c09-a343-efdb17c32cf4" />

   <img width="1916" height="918" alt="image" src="https://github.com/user-attachments/assets/624bbc2d-7958-409c-ba49-dd6dc352923b" />

</div>

---

## 💻 Tech Stack

- **Frontend:** Next.js 15, React, Tailwind CSS
- **Backend:** Python 3.12+, OpenCV, ffmpeg, Faster Whisper, Ultralytics YOLOv8
- **AI Summaries:** Ollama LLM 
- **Deployment:** Ready for Vercel, Render, or any server supporting Next.js + Python API

---

## ⚡ Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/yourusername/ai-video-analyzer.git
cd ai-video-analyzer
```

### 2️⃣ Install Next.js frontend dependencies

```bash
cd frontend
npm install
```

### 3️⃣ Install Python backend dependencies

```bash
cd ../backend
pip install -r requirements.txt
```

### 4️⃣ Run the Next.js frontend

```bash
cd frontend
npm run dev
```

### 5️⃣ Run the Python video analysis script

```bash
python analyze_video_fast.py <video.mp4> output.json [device]
```

- `video.mp4`: Path to your input video
- `output.json`: Path to save analysis results
- `[device]`: Optional, use `cpu` or `cuda`

---

## 🛠️ Integrating Ollama Llama 3.2 Vision

Ollama **Llama 3.2 Vision** is required for AI-powered image and video frame analysis.

---

## 🛠️ Integrating Ollama Llama 3.2 Vision

Ollama **Llama 3.2 Vision** is required for AI-powered image and video frame analysis.

---

### 1️⃣ Install Ollama

- Download Ollama from the [official website](https://ollama.com)  
- Follow the installation instructions for your OS

---

### 2️⃣ Pull the Llama 3.2 Vision Model

Open a terminal and run:

```bash
# This will download the Ollama model
ollama pull llama3.2-vision

---

### 3️⃣ This command will run the ollama model

```bash
ollama serve



## 🖱 Usage

1. Open the web app in your browser.
2. Upload your video via drag-and-drop.
3. Click **Upload & Analyze**.
4. View:
     - Key frames
     - Object detections
     - Transcript
     - Visual summary
     - AI-generated summary (if enabled)

---

## 🌟 Roadmap

- Real-time streaming video analysis
- Multi-language transcription support
- Integration with more LLMs for advanced summaries
- Download results as PDF/JSON

---

## 📂 Folder Structure

```
ai-video-analyzer/
├─ frontend/               # Next.js app
│  ├─ src/
│  │  ├─ app/
│  │  │  ├─ page.js
│  │  │  └─ home/
│  │  │      └─ page.js
│  │  ├─ components/
│  │  │  └─ VideoAnalyzer.jsx
│  │  └─ styles/
│  └─ package.json
├─ backend/                # Python analysis scripts
│  ├─ analyze_video_fast.py
│  └─ requirements.txt
└─ README.md
```
