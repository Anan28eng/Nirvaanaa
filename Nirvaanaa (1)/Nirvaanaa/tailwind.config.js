/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      colors: {
        nirvaanaa: {
          primary: "rgb(165 227 249 / <alpha-value>)",
          secondary: "rgb(7 30 201 / <alpha-value>)",
          dark: "rgb(5 22 150 / <alpha-value>)",
          'primary-light': "rgba(165, 227, 249, 0.1)",
          'primary-lighter': "rgba(165, 227, 249, 0.05)",
          'secondary-light': "rgba(7, 30, 201, 0.1)",
          'secondary-dark': "rgb(5, 22 150)",
          'soft-gold': "rgb(217 192 141 / <alpha-value>)",
          'shell': "#e6f0f9",
          'offwhite': '#e6f0f9',
        },
      },

      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },

      backgroundImage: {
        'nirvaanaa-art': 'radial-gradient(circle at 18% 18%, rgba(165, 227, 249, 0.45), transparent 48%), radial-gradient(circle at 78% 0%, rgba(7, 30, 201, 0.12), transparent 34%), linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(165, 227, 249, 0.55))',
        'nirvaanaa-ribbon': 'linear-gradient(122deg, rgba(7, 30, 201, 0.92) 0%, rgba(165, 227, 249, 0.82) 100%)',
        'nirvaanaa-soft': 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 245, 237, 0.85) 45%, rgba(165, 227, 249, 0.35) 100%)',
        'nirvaanaa-veil': 'radial-gradient(circle at 10% 20%, rgba(249, 245, 237, 0.92), transparent 45%), radial-gradient(circle at 82% 8%, rgba(165, 227, 249, 0.32), transparent 32%), linear-gradient(160deg, rgba(255, 255, 255, 0.88), rgba(165, 227, 249, 0.4) 60%, rgba(7, 30, 201, 0.15))',
        'nirvaanaa-deep': 'radial-gradient(circle at 12% 18%, rgba(165, 227, 249, 0.55), transparent 50%), radial-gradient(circle at 70% 5%, rgba(7, 30, 201, 0.18), transparent 36%), linear-gradient(120deg, rgba(249, 245, 237, 0.92), rgba(165, 227, 249, 0.42), rgba(255, 255, 255, 0.95))',
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      boxShadow: {
        elegant: '0 8px 24px rgba(7, 30, 201, 0.25)',
        soft: '0 2px 8px rgba(7, 30, 201, 0.08)',
        'nirvaanaa': '0 4px 12px rgba(7, 30, 201, 0.25)',
        'nirvaanaa-hover': '0 8px 24px rgba(7, 30, 201, 0.35)',
        'nirvaanaa-soft': '0 25px 55px rgba(7, 30, 201, 0.12)',
        'nirvaanaa-glow': '0 35px 120px rgba(165, 227, 249, 0.25)',
      },
    },
  },

  plugins: [],
};
