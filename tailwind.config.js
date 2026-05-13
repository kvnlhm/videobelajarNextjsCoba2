module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./styles/**/*.{css,scss}",
  ],
  theme: {
    extend: {
      colors: {
        'videobelajar-orange': '#FF9D00',
        'videobelajar-green': '#00A896',
        'videobelajar-light-green': '#7ED321',
        'videobelajar-cream': '#FFF9E5',
        'videobelajar-dark': '#1A1A1A',
      },
      fontFamily: {
        'sans': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
