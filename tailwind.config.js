/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Palette de couleurs basée sur l'image fournie
        primary: {
          50: '#e6f0f5',
          100: '#cce0eb',
          200: '#99c2d7',
          300: '#66a3c3',
          400: '#3385af',
          500: '#00669b', // Bleu foncé (première colonne)
          600: '#00527c',
          700: '#003d5d',
          800: '#00293e',
          900: '#00141f',
        },
        secondary: {
          50: '#e6eef5',
          100: '#ccddeb',
          200: '#99bbd7',
          300: '#6699c3',
          400: '#3377af',
          500: '#00559b', // Bleu moyen (deuxième colonne)
          600: '#00447c',
          700: '#00335d',
          800: '#00223e',
          900: '#00111f',
        },
        accent: {
          50: '#f0f5f9',
          100: '#e1ebf3',
          200: '#c3d7e7',
          300: '#a5c3db',
          400: '#87afcf',
          500: '#699bc3', // Bleu clair (troisième colonne)
          600: '#547c9c',
          700: '#3f5d75',
          800: '#2a3e4e',
          900: '#151f27',
        },
        green: {
          50: '#e9f2e9',
          100: '#d3e6d3',
          200: '#a7cca7',
          300: '#7bb37b',
          400: '#4f994f',
          500: '#237f23', // Vert (quatrième colonne)
          600: '#1c661c',
          700: '#154c15',
          800: '#0e330e',
          900: '#071907',
        },
        lime: {
          50: '#f2f7e6',
          100: '#e5efcc',
          200: '#cbdf99',
          300: '#b1cf66',
          400: '#97bf33',
          500: '#7daf00', // Vert lime (cinquième colonne)
          600: '#648c00',
          700: '#4b6900',
          800: '#324600',
          900: '#192300',
        },
      },
    },
  },
  plugins: [],
};