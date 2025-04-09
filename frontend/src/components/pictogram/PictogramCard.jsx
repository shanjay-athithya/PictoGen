// components/PictogramCard.jsx
import { motion } from "framer-motion";
import { Tooltip } from "react-tooltip";
import "./PictogramCard.css";

export default function PictogramCard({ word, image }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="pictogram-card"
      data-tooltip-id={`tooltip-${word}`}
      data-tooltip-content={word}
    >
      <div className="pictogram-image-wrapper">
        <img src={image} alt={word} className="pictogram-image" />
      </div>
      <p className="pictogram-word">{word}</p>
      <Tooltip id={`tooltip-${word}`} />
    </motion.div>
  );
}
