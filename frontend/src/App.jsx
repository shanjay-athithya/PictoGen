import { useState } from "react";
import axios from "axios";
import PictogramCard from "./components/PictogramCard";
import SpeechToTextMic from "./components/SpeechToTextMic";
import "./App.css";

export default function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSimplified = async (customText) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:8000/simplify", {
        text: textToSend,
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
    <div className="app">
      <div className="container">
        <h1>Pictogram Generator</h1>
        <p className="subtitle">
          Type or speak a sentence to simplify and visualize it.
        </p>

        <SpeechToTextMic onResult={handleSpeechResult} />

        <textarea
          className="input-text"
          rows="3"
          placeholder="Enter your text..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={() => fetchSimplified()}
          disabled={loading}
          className="generate-btn"
        >
          {loading ? "Processing..." : "Generate Pictograms"}
        </button>
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
