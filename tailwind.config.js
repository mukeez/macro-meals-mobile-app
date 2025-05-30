/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    fontSize: {
      'xs': '12px',      // Smallest text (captions, labels)
      'sm': '14px',      // Small text (secondary text)
      'base': '16px',    // Body text
      'lg': '18px',      // Slightly larger body text
      'xl': '20px',      // Subheadings
      '2xl': '24px',     // Headings
      '3xl': '30px',     // Large headings
      '4xl': '36px',     // Extra large headings
      '5xl': '48px',     // Hero text
    },
    extend: {
      colors:{
        primary: '#009688',
        secondary: '#58B74F',
        accent: '#AB8BFF',
        gold: '#FEBF00',
        indicatorActive: "#01675B",
        indicatorInactive: "#b3d1ce",
        lightGrey: "#B0B0B0"
      }
    },
  },
  plugins: [],
};

