module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canal: { DEFAULT: '#0B3954', dark: '#072538', soft: '#E6EEF3' },
        balcony: { DEFAULT: '#7A2E2A', soft: '#F4E7E5' },
        dome: { DEFAULT: '#3F8F86', soft: '#E3F1EF' },
        salt: '#F7F9FA',
        brass: { DEFAULT: '#C58B1F', soft: '#FBF1DC' },
      },
      fontFamily: {
        display: ['"Reem Kufi"', 'Tahoma', 'sans-serif'],
        body: ['"IBM Plex Sans Arabic"', 'Tahoma', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
