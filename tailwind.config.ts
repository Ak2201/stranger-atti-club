import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        marigold: {
          DEFAULT: '#E8A33D',
          50: '#FDF6E8',
          100: '#FAEAC4',
          200: '#F5D689',
          300: '#F0C04E',
          400: '#E8A33D',
          500: '#D38628',
          600: '#A86620',
          700: '#7E4A18',
          800: '#523010',
          900: '#2A1808',
        },
        crimson: {
          DEFAULT: '#B22222',
          50: '#FBEAEA',
          100: '#F5C9C9',
          200: '#E89393',
          300: '#D85D5D',
          400: '#B22222',
          500: '#8B1A1A',
          600: '#6E1414',
          700: '#510E0E',
        },
        cream: {
          DEFAULT: '#FFF8E7',
          50: '#FFFDF7',
          100: '#FFF8E7',
          200: '#FBF0CF',
        },
        ink: {
          DEFAULT: '#1A1A1A',
          soft: '#3A3A3A',
          mute: '#6B6B6B',
        },
        leaf: '#6B8E5A',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '65ch',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        floatup: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        floatup: 'floatup 0.6s ease-out both',
        shimmer: 'shimmer 8s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
