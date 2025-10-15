/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0f172a',
        dawn: '#fde68a',
        mist: '#e0f2f1',
        fog: '#cbd5f5',
      },
    },
  },
  plugins: [],
};
