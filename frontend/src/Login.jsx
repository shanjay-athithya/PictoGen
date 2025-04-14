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
      <div className="w-full mt-0 md:w-1/2 h-3/5 md:h-auto order-1 md:order-none">
        <img
          src="https://ik.imagekit.io/hmx3cjrmq/image.png?updatedAt=1744540888367"
          alt="PictoGen"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-black p-8 order-2 md:order-none">
        <div className="max-w-md w-full text-white text-center">
          <img
            src="https://ik.imagekit.io/hmx3cjrmq/PictoGen.png?updatedAt=1744651159195"
            alt="PictoGen Logo"
            className="mx-auto w-72 h-40 object-contain"
          />
          <h1 className="text-3xl text-red-500 font-bold mb-6">
            Welcome to PictoGen
          </h1>
          
          
          <div className="flex justify-center">
            <button
              onClick={handleLogin}
              className="bg-white hover:bg-red-700 text-red-500 font-bold py-2 px-6 rounded"
            >
              Login with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
