/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        rescue: {
          primary: "#22c55e",
          dark: "#166534",
          gray: "#f3f4f6",
          white: "#ffffff",
        },
      },
      boxShadow: {
        panel: "0 10px 40px rgba(22, 101, 52, 0.15)",
      },
    },
  },
  plugins: [],
};
