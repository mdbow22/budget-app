import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#649C64",

          secondary: "#A39171",

          accent: "#6D4C3D",

          neutral: "#F0EAE6",

          "base-100": "#F0EAE6",

          info: "#A1CEC6",

          success: "#36d399",

          warning: "#fbbd23",

          error: "#f87272",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
} satisfies Config;
