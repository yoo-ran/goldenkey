/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./src/*.{html,js,jsx,ts,tsx}",
    "./*.{html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yellow: '#F2BB57',
        white: '#fff',
        navy: "#393B58",
        lightPurple: "#D4D2E3",
        lightBlack: "#1D1B20",
        darkGray:"#D9D9D9"
      },
      fontFamily: {
        'head': ['"Do Hyeon"'],
      },
    },
  },
  plugins: [],
}

