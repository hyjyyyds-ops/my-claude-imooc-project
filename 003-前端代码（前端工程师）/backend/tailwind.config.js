/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'pink-primary': '#FFB7C5',
        'pink-soft':    '#FFD1DC',
        'purple-soft':  '#E6E6FA',
        'bg-pink':      '#FFF5F7',
        'text-brown':   '#5D4037',
        'text-warm':    '#8D7B7B',
        'expense':      '#FF8A80',
        'income':       '#A5D6A7',
      },
      borderRadius: { 'cute': '20px' },
      boxShadow:    { 'soft': '0 4px 20px rgba(255, 183, 197, 0.25)' },
    },
  },
  plugins: [],
};
