/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'fredoka': ['Fredoka One', 'cursive'],
        'roboto': ['Roboto', 'sans-serif'],
      },
      colors: {
        'gelato': {
          'pink': '#ff6b9d',
          'blue': '#4ecdc4',
          'yellow': '#ffe066',
          'orange': '#ff8a50',
          'cream': '#fff8f3',
          'chocolate': '#8b4513',
          'berry': '#8e44ad',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}