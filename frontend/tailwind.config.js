// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ghibliBlue: "#a7c4c2",
        ghibliYellow: "#f5e8b7",
        ghibliPink: "#f9d5d3",
      },
      fontFamily: {
        sans: ['"Poppins"', "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
