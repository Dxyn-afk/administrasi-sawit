/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
      },
      keyframes: {
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
      },
    },
  },
  plugins: [],
};
