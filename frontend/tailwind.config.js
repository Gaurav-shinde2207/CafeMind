/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cafe: {
          ivory: '#FAF7F2',
          cream: '#F4EFE6',
          sand: '#ECE4DB',
          card: '#FFFFFF',
          espresso: '#2D1E18',
          espressoLight: '#3D2A22',
          brown: '#5C4033',
          terracotta: '#C86D51',
          terracottaDark: '#B0593E',
          terracottaLight: '#FBECE8',
          sage: '#4A7C59',
          sageLight: '#EBF4EE',
          border: '#E8DFD8',
          accent: '#D4A373'
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif']
      }
    },
  },
  plugins: [],
}
