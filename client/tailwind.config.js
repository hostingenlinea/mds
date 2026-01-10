/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores exactos de tu referencia MDS Global
        mds: {
          dark: '#030816',    // Fondo Sidebar (Casi negro)
          blue: '#2563EB',    // Botón Azul Brillante
          hover: '#1e293b',   // Hover menú
          text: '#94a3b8'     // Texto grisáceo
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}