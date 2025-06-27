/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  experimental: {
    useInsertionEffect: false,
  },
  theme: {
    fontFamily: {
      sans: ['UncutSans'],
      'sans-medium': ['UncutSans-Medium'],
      'sans-semibold': ['UncutSans-Semibold'],
      'sans-bold': ['UncutSans-Bold'],
      'general-sans': ['GeneralSans-Regular'],
      'general-sans-medium': ['GeneralSans-Medium'],
      'general-sans-semibold': ['GeneralSans-Semibold'],
      'general-sans-bold': ['GeneralSans-Bold'],

    },
    fontSize: {
      'xs': '12px',      // Smallest text (captions, labels)
      'sm': '14px',      // Small text (secondary text)
      'base': '16px',    // Body text
      'lg': '18px',      // Slightly larger body text
      'xl': '20px',      // Subheadings
      '2xl': '24px',     // Headings
      '3xl': '30px',     // Large headings
      '4xl': '36px',     // Extra large headings
      '5xl': '48px',     // Hero text
    },
    extend: {
      colors:{
        primary: '#01675B',
        primaryLight: '##009688',
        secondary: '#58B74F',
        accent: '#AB8BFF',
        black: '#333333',
        indicatorActive: "#01675B",
        indicatorInactive: "#b3d1ce",
        aquaSqueeze: "#E6F4F1",
        lightGreen: "#DFF4F4",
        gray: "#F2F2F2",
        lightGrey: "#B0B0B0",
        mediumGrey: "#707070",
        textMediumGrey: "#4F4F4F",
        paleCyan: "#DFF4F4",
        amber: "#FEBF00",
        gloomyPurple: "#7E54D9",
        lavenderPink: "#E283E0",
        kryptoniteGreen: "#44A047",
        brightRed: '#FF4343',
        cinnabarRed: '##E53835',
        punchRed: '#DB2F2C',
        silver: "#BDBDBD",
        grey: '#f5f5f5',
        cornflowerBlue: '#C4E7E3',
        jungleGreen: '#20A090',
        lynch: '#607D8B',
        galleryBg: '#f3f3f3',
        textLightGrey: '#8e929a',
        borderGallery: '#f3f3f3',
      },
      spacing: {
        '11.3': '11.3rem', // 181px
        '4.25': '4.25rem', // 68px
        '43': '43px',      // 43px icon
        '280': '280px',    // quick add card width
      },
    },
  },
  plugins: [],
};

