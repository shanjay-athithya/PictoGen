import { useState } from "react";
import axios from "axios";
import PictogramCard from "./components/PictogramCard";
import SpeechToTextMic from "./components/SpeechToTextMic";
import { simplifyTranscript } from "./components/simplifyTranscript";
import "./App.css";

export default function App() {
  const [input, setInput] = useState("");
  const [simplifiedText, setSimplifiedText] = useState("");
  const [showSimplified, setShowSimplified] = useState(true);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);
  const [imageCaption, setImageCaption] = useState("");

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setImageCaption("");
    setResult(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8001/caption", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setImageCaption(data.caption);

      const simplified = simplifyTranscript(data.caption);
      setSimplifiedText(simplified);

      const response = await axios.post("http://localhost:8000/simplify", {
        text: simplified,
      });

      const pictograms = await Promise.all(
        response.data.simplified.map(async (word) => {
          const res = await axios.get(
            `http://localhost:8000/pictogram/${word}`
          );
          return { word, image: res.data.image_url };
        })
      );

      setResult({ ...response.data, pictograms });
    } catch (err) {
      console.error("Image captioning error:", err);
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <div className="container">
        <h1>Pictogram Generator</h1>
        <p className="subtitle">
          Type, speak, or upload an image to simplify and visualize.
        </p>

        <SpeechToTextMic onResult={handleSpeechResult} />

        <textarea
          className="input-text"
          rows="3"
          placeholder="Enter your text..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="toggle-container">
          <label className="switch">
            <input
              type="checkbox"
              checked={showSimplified}
              onChange={() => setShowSimplified(!showSimplified)}
            />
            <span className="slider"></span>
          </label>
          <span className="toggle-label">
            {showSimplified ? "Simplified View" : "Original View"}
          </span>
        </div>

        {simplifiedText && (
          <div className="preview-sentence">
            <strong>Preview:</strong> {showSimplified ? simplifiedText : input}
          </div>
        )}

        <button
          onClick={() => fetchSimplified()}
          disabled={loading}
          className="generate-btn"
        >
          {loading ? "Processing..." : "Generate Pictograms"}
        </button>
      </div>

      <div className="container" style={{ marginTop: "2rem" }}>
        <h2>🖼️ Upload an Image</h2>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {imagePreview && (
          <>
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: "300px",
                marginTop: "10px",
                borderRadius: "10px",
                boxShadow: "0 0 10px rgba(0,0,0,0.2)",
              }}
            />
            <p style={{ marginTop: "10px" }}>
              <strong>Caption:</strong> {imageCaption}
            </p>
          </>
        )}
      </div>

      {result && (
        <div className="pictogram-outer">
          <div className="pictogram-inner">
            {result.pictograms.map(({ word, image }, idx) => (
              <PictogramCard key={idx} word={word} image={image} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
