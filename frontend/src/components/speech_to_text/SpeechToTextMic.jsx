import React, { useEffect, useRef, useState } from "react";
import "./SpeechToTextMic.css";

const SpeechToTextMic = ({ onResult }) => {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const micStreamRef = useRef(null);
  const animationRef = useRef(null);
  const volumeRef = useRef(0);

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
      startVolumeDetection();
    };

    recognition.onerror = (event) => {
      setListening(false);
      stopVolumeDetection();
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
      stopVolumeDetection();
    };

    recognition.start();
  };

  const startVolumeDetection = async () => {
    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStreamRef.current = stream;

    const source = audioContextRef.current.createMediaStreamSource(stream);
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      volumeRef.current = average;

      drawWave();
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const stopVolumeDetection = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) audioContextRef.current.close();
  };

  const handleClick = () => {
    setError("");
    startSpeechRecognition();
  };

  const drawWave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const time = Date.now() / 1000;
    const amplitude = Math.min(volumeRef.current / 1.5, 80); // increase amplitude cap for more height
    const frequency = 0.015;

    ctx.clearRect(0, 0, width, height);

    // Create wave path
    ctx.beginPath();
    ctx.moveTo(0, height / 2);

    for (let x = 0; x <= width; x++) {
      const y =
        height / 2 +
        Math.sin(x * frequency + time * 4) * amplitude * Math.sin(time * 2);
      ctx.lineTo(x, y);
    }

    // Fill to bottom for thick wave
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, height / 2, 0, height);
    gradient.addColorStop(0, "rgba(0, 123, 255, 0.5)");
    gradient.addColorStop(1, "rgba(0, 123, 255, 0.1)");

    ctx.fillStyle = gradient;
    ctx.fill();

    // Optional: add stroke for definition
    ctx.strokeStyle = "#dc3545";
    ctx.lineWidth = 3;
    ctx.stroke();
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

      {listening && (
        <canvas
          ref={canvasRef}
          width={500}
          height={100}
          className="wave-canvas"
        />
      )}
      {error && <p className="mic-error">{error}</p>}
    </div>
  );
};

export default SpeechToTextMic;
