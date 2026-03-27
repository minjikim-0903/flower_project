/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B9D',
        seller: '#2ECC71',
        admin: '#6C5CE7',
        'text-primary': '#333333',
        'text-secondary': '#999999',
        border: '#F0F0F0',
        background: '#f8f8f8',
        error: '#FF3B30',
      },
    },
  },
  plugins: [],
};
