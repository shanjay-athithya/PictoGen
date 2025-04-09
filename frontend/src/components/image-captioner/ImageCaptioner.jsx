import { useState } from "react";
import axios from "axios";
import { simplifyTranscript } from "../simplifyTranscript";
import "./ImageCaptioner.css";

export default function ImageCaptioner({
  onResult,
  setSimplifiedText,
  setLoading,
}) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageCaption, setImageCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleImageProcess = async (file) => {
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setImageCaption("");
    setProgress(0);
    setUploading(true);
    setLoading(true);
    onResult(null);

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

      const response = await axios.post(
        "http://localhost:8000/simplify",
        {
          text: simplified,
        },
        {
          onUploadProgress: (event) => {
            const percent = Math.round((event.loaded * 100) / event.total);
            setProgress(percent);
          },
        }
      );

      const pictograms = await Promise.all(
        response.data.simplified.map(async (word) => {
          const res = await axios.get(
            `http://localhost:8000/pictogram/${word}`
          );
          return { word, image: res.data.image_url };
        })
      );

      onResult({ ...response.data, pictograms });
    } catch (err) {
      console.error("Image captioning error:", err);
    }

    setUploading(false);
    setLoading(false);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleImageProcess(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleImageProcess(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  return (
    <div
      className={`image-captioner-container ${dragActive ? "drag-active" : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDrag}
      onDragEnter={handleDrag}
      onDragLeave={() => setDragActive(false)}
    >
      <h2 className="image-captioner-title">🖼️ Upload or Drag an Image</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="image-captioner-input"
      />

      {uploading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="progress-label">{progress}%</p>
        </div>
      )}

      {imagePreview && !uploading && (
        <div className="image-preview-wrapper">
          <img src={imagePreview} alt="Preview" className="image-preview" />
          <p className="image-caption">
            <strong>Caption:</strong> {imageCaption}
          </p>
        </div>
      )}
    </div>
  );
}
