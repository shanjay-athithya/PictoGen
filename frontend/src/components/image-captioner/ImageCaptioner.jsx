import { useState } from "react";
import axios from "axios";
import { simplifyTranscript } from "../simplifyTranscript";

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
      className={`mt-8 px-4 sm:px-8 max-w-4xl mx-auto py-6 border-2 border-dashed rounded-lg transition-all duration-200 ${
        dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-black"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDrag}
      onDragEnter={handleDrag}
      onDragLeave={() => setDragActive(false)}
    >
      <h2 className="text-xl sm:text-2xl font-semibold text-center mb-4">
        🖼️ Upload or Drag an Image
      </h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="block w-full text-sm text-gray-700 mb-6 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-blue-700"
      />

      {uploading && (
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <div className="w-full bg-gray-200 h-2 rounded">
            <div
              className="bg-red-500 h-2 rounded"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">{progress}%</p>
        </div>
      )}

      {imagePreview && !uploading && (
        <div className="mt-6 text-center">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-w-full mx-auto rounded-lg shadow-md"
          />
          <p className="mt-4 text-sm text-gray-700">
            <strong>Caption:</strong> {imageCaption}
          </p>
        </div>
      )}
    </div>
  );
}
