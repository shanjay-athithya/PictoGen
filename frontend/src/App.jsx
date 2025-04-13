import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { simplifyTranscript } from "./components/simplifyTranscript";
import PictogramCard from "./components/pictogram/PictogramCard";
import SpeechToTextMic from "./components/speech_to_text/SpeechToTextMic";
import ImageCaptioner from "./components/image-captioner/ImageCaptioner";
import Navbar from "./components/navbar/Navbar";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import ThreeBackground from "./components/ThreeBackground";
import { FaKeyboard, FaMicrophone, FaImage } from "react-icons/fa";
import "./App.css";
import girlIcon from "./assets/girl.png";
import boyIcon from "./assets/boy.png";


// Firebase auth
import { useAuth } from "./context/AuthContext";
import Login from "./Login";

export default function App() {
  const { user, authLoading, logout } = useAuth();

  const [input, setInput] = useState("");
  const [simplifiedText, setSimplifiedText] = useState("");
  const [showSimplified, setShowSimplified] = useState(true);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("text");

  const containerRef = useRef();

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    setInput("");
    setSimplifiedText("");
    setResult(null);
  }, [mode]);

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
          const res = await axios.get(`http://localhost:8000/pictogram/${word}`);
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

  const handleLogout = async () => {
    await logout();
    navigate("/"); // Redirect to login page
  };

  if (authLoading) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }
  

  return (
    <div className="min-h-screen bg-black text-white relative font-sans pb-20">
      <ThreeBackground />

      {/* Top bar with user info (fixed at top) */}
      <div className="fixed top-0 left-0 w-full flex justify-between items-center p-4 bg-black backdrop-blur-md border-b border-white/20 z-30">
        <div className="flex items-center gap-3">
          <img
            src={user.image}
            alt="user"
            className="w-10 h-10 rounded-full border border-white/30"
          />
          <div className="text-sm leading-tight">
            <div className="font-semibold">{user.displayName || user.name}</div>
            <div className="text-white/60">{user.email}</div>
          </div>
        </div>
        <button
  onClick={() => {
    console.log("Logout button clicked");
    handleLogout();
  }}
  className="text-sm px-4 py-1.5 rounded-xl border border-white/30 hover:bg-white/10 transition"
>
  Sign Out
</button>

      </div>

      {/* Desktop Navbar */}
          {/* Desktop Navbar below header, fixed */}
          <div className="hidden lg:block fixed top-[80px] w-full z-30">
            <div className="flex justify-center">
              <div className="bg-black w-full max-w-4xl rounded-b-2xl">
                <AnimatePresence mode="wait">
                  <Navbar setMode={setMode} currentMode={mode} />
                </AnimatePresence>
              </div>
            </div>
          </div>
      <div
        ref={containerRef}
        className="relative z-10 px-4 py-8 pb-40"
      >
        <div className="flex flex-col lg:flex-row justify-center gap-10">
          


          <div className="w-full mt-32 lg:mt-48 md:mt-48  max-w-2xl mx-auto">
            <motion.div
              className="bg-white/10 rounded-2xl p-6 border border-white/20 backdrop-blur-xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 10 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-red-500 text-center mb-4">
                PictoGen
              </h1>

              <AnimatePresence mode="wait">
                {mode === "text" && (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <textarea
                      className="w-full mt-8 p-4 rounded-xl text-black bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows={4}
                      placeholder="Type your sentence to generate pictograms..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                    <button
                      onClick={() => fetchSimplified()}
                      disabled={loading}
                      className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-xl transition"
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
                  <div className="flex justify-end mt-4 mb-2">
                    <label className="flex items-center gap-2 text-sm">
                      <span>Show Simplified</span>
                      <input
                        type="checkbox"
                        checked={showSimplified}
                        onChange={() => setShowSimplified(!showSimplified)}
                        className="w-5 h-5"
                      />
                    </label>
                  </div>

                  <div className="bg-black/20 p-3 rounded-md mb-4">
                    <strong>Preview:</strong>{" "}
                    {showSimplified ? simplifiedText : input}
                  </div>
                </>
              )}

              {result && (
                <motion.div layout className="pictogram-gallery grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-6 px-2 sm:px-0">
                  {result?.pictograms.map(({ word, image }, index) => (
                    <PictogramCard key={index} word={word} image={image} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Decorative Icons */}
        <img src={boyIcon} alt="Right Icon" className="boy-icon fixed hidden mt-40 sm:block" />
        <img src={girlIcon} alt="Left Icon" className="girl-icon fixed hidden mt-40 sm:block" />
      </div>

      {/* Mobile Bottom Navbar */}
<div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/10 backdrop-blur-lg border-t border-white/20 flex justify-around py-2 z-50">
  <button onClick={() => setMode("text")} className={`flex flex-col items-center text-xs ${mode === "text" ? "text-red-400" : "text-white"}`}>
    <FaKeyboard className="text-lg" />
    Text
  </button>
  <button onClick={() => setMode("image")} className={`flex flex-col items-center text-xs ${mode === "image" ? "text-red-400" : "text-white"}`}>
    <FaImage className="text-lg" />
    Image
  </button>
  <button onClick={() => setMode("speech")} className={`flex flex-col items-center text-xs ${mode === "speech" ? "text-red-400" : "text-white"}`}>
    <FaMicrophone className="text-lg" />
    Speech
  </button>
  
</div>

    </div>
  );
}
