// components/Navbar.jsx
import { motion } from "framer-motion";
import "./Navbar.css";

const navItems = [
  { label: "Text ➝ Pictograms", value: "text", emoji: "💬" },
  { label: "Image ➝ Caption ➝ Pictograms", value: "image", emoji: "🖼️" },
  { label: "Speech ➝ Caption ➝ Pictograms", value: "speech", emoji: "🎤" },
];

const navbarVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "tween",
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export default function Navbar({ setMode, currentMode }) {
  return (
    <motion.nav
      className="navbar-modern"
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {navItems.map(({ label, value, emoji }) => {
        const isActive = currentMode === value;
        return (
          <motion.button
            key={value}
            onClick={() => setMode(value)}
            className={`nav-modern-btn ${isActive ? "active-nav-btn" : ""}`}
            variants={buttonVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            <span className="emoji">{emoji}</span>
            <span className="label">{label}</span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}
