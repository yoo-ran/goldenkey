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
        primary: {
          yellow: '#F2BB57',
          DEFAULT: '#393B58',
          blue: '#3578FF',
        },
        secondary: {
          yellow: '#FFEFD4',
          DEFAULT: '#9C9CAE',
          light: '#E7E6F2',
          blue: '#DAE8FF',
        },
      },
      borderRadius: {
        '4xl': '35px', 
      },
      fontFamily: {
        'head': [' "Open Sans", sans-serif;'],
      },
    },
  },
  plugins: [],
}

