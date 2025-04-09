// App.jsx
import { useState } from "react";
import axios from "axios";
import { simplifyTranscript } from "./components/simplifyTranscript";
import PictogramCard from "./components/pictogram/PictogramCard";
import SpeechToTextMic from "./components/speech_to_text/SpeechToTextMic";
import ImageCaptioner from "./components/image-captioner/ImageCaptioner";
import Navbar from "./components/navbar/Navbar";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";

export default function App() {
  const [input, setInput] = useState("");
  const [simplifiedText, setSimplifiedText] = useState("");
  const [showSimplified, setShowSimplified] = useState(true);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("text");

  const fetchSimplified = async (customText) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    const simplified = simplifyTranscript(textToSend);
    setSimplifiedText(simplified);
    setResult(null);
    setLoading(true);

    try {
      const { data } = await axios.post("http://localhost:8000/simplify", {
        text: simplified,
      });

      const pictograms = await Promise.all(
        data.simplified.map(async (word) => {
          const res = await axios.get(
            `http://localhost:8000/pictogram/${word}`
          );
          return { word, image: res.data.image_url };
        })
      );

      setResult({ ...data, pictograms });
    } catch (err) {
      console.error("Error:", err);
    }

    setLoading(false);
  };

  const handleSpeechResult = (text) => {
    setInput(text);
    fetchSimplified(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ghibliYellow via-ghibliBlue to-white px-4 py-8 font-sans">
      <div className="flex flex-col lg:flex-row justify-center gap-10">
        <AnimatePresence mode="wait">
          {true && ( // conditionally render based on app logic if needed
            <Navbar setMode={setMode} key="navbar" />
          )}
        </AnimatePresence>
        <motion.div
          className="flex-1 max-w-3xl bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-8 border border-ghibliPink"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl font-bold text-center text-ghibliBlue mb-4 drop-shadow">
            🌿 Pictogram Generator
          </h1>

          <AnimatePresence mode="wait">
            {mode === "text" && (
              <motion.div
                key="text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-mode-container"
              >
                <textarea
                  className="text-input-box"
                  rows={4}
                  placeholder="Type your sentence to generate pictograms..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />

                <button
                  onClick={() => fetchSimplified()}
                  disabled={loading}
                  className="generate-btn"
                >
                  {loading ? "Processing..." : "✨ Generate Pictograms"}
                </button>
              </motion.div>
            )}

            {mode === "speech" && (
              <motion.div
                key="speech"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SpeechToTextMic onResult={handleSpeechResult} />
              </motion.div>
            )}

            {mode === "image" && (
              <motion.div
                key="image"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <ImageCaptioner
                  onResult={setResult}
                  setSimplifiedText={setSimplifiedText}
                  setLoading={setLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {simplifiedText && (
            <>
              <div className="toggle-wrapper">
                <label
                  className="switch"
                  title="Toggle simplified/original text"
                >
                  <input
                    type="checkbox"
                    checked={showSimplified}
                    onChange={() => setShowSimplified(!showSimplified)}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="preview-text">
                <strong>Preview:</strong>{" "}
                {showSimplified ? simplifiedText : input}
              </div>
            </>
          )}

          {result && (
            <motion.div layout>
              <div className="pictogram-gallery">
                {result?.pictograms.map(({ word, image }, index) => (
                  <PictogramCard key={index} word={word} image={image} />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
