/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Poppins", "sans-serif"] },
      keyframes: {
        rowIn:   { from:{ opacity:0, transform:"translateX(-8px)" }, to:{ opacity:1, transform:"translateX(0)" } },
        fadeUp:  { from:{ opacity:0, transform:"translateY(12px)" }, to:{ opacity:1, transform:"translateY(0)" } },
        slideUp: { from:{ opacity:0, transform:"translateY(8px)"  }, to:{ opacity:1, transform:"translateY(0)" } },
      },
      animation: {
        "row-in":   "rowIn   0.22s ease both",
        "fade-up":  "fadeUp  0.30s ease both",
        "slide-up": "slideUp 0.25s ease both",
      },
    },
  },
  plugins: [],
};
