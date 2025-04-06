import "./PictogramCard.css";

export default function PictogramCard({ word, image }) {
  return (
    <div className="pictogram-card">
      {image ? (
        <img src={image} alt={word} className="pictogram-image" />
      ) : (
        <div className="pictogram-placeholder">No image</div>
      )}
      <span className="pictogram-word">{word}</span>
    </div>
  );
}
