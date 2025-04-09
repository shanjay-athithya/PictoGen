// src/simplifyTranscript.js
import nlp from "compromise";

const removeWords = [
  "a",
  "an",
  "the",
  "here",
  "there",
  "very",
  "really",
  "is",
  "are",
  "was",
  "were",
  "been",
  "being",
  "do",
  "does",
  "did",
];

export function simplifyTranscript(input) {
  const doc = nlp(input);
  const lemmatized = doc.terms().out("lemma").toLowerCase();

  const filtered = lemmatized
    .split(" ")
    .filter((word) => !removeWords.includes(word) && word.trim().length > 0);
  return filtered.join(" ");
}
