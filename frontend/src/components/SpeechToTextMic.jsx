import React, { useState } from "react";
import "./SpeechToTextMic.css";

const SpeechToTextMic = ({ onResult }) => {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");

  const startSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setError("");
    };

    recognition.onerror = (event) => {
      setListening(false);
      if (event.error === "no-speech") {
        setError("No speech detected. Please try again and speak clearly.");
      } else if (event.error === "not-allowed") {
        setError("Microphone permission denied. Please allow mic access.");
      } else {
        setError("Speech recognition error: " + event.error);
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const handleClick = () => {
    setError("");
    startSpeechRecognition();
  };

  return (
    <div className="mic-container">
      <button
        className={`mic-button ${listening ? "listening" : ""}`}
        onClick={handleClick}
        disabled={listening}
      >
        {listening ? "🎙 Listening..." : "🎤 Speak"}
      </button>
      {error && <p className="mic-error">{error}</p>}
    </div>
  );
};

export default SpeechToTextMic;
