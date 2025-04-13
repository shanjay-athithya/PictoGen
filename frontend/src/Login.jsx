import React from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";

export default function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-black h-screen">
      {/* Left Side - Image */}
      <div className="w-full mt-0 md:w-1/2 h-2/3 md:h-auto order-1 md:order-none">
        <img
          src="https://ik.imagekit.io/hmx3cjrmq/image.png?updatedAt=1744540888367"
          alt="PictoGen"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-black p-8 order-2 md:order-none">
        <div className="max-w-md w-full text-white">
          <h1 className="text-3xl font-bold mb-4">
            Welcome to PictoGen
          </h1>
          <p className="mb-6">
            Transform your words into pictograms effortlessly.
          </p>
          <button
            onClick={handleLogin}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
          >
            🔐 Login with Google
          </button>
        </div>
      </div>
    </div>
  );
}
