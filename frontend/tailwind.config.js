/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // pastikan semua file React ter-cover
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#113F67',
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
        'fade-in-down': 'fadeInDown 1s ease-in-out',
        'fade-in-up': 'fadeInUp 1s ease-in-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        fadeInDown: { '0%': { opacity: 0, transform: 'translateY(-20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeInUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      }
    },
  },
  plugins: [],
}


