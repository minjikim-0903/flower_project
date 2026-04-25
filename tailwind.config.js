/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Bloom Design System (2026-04)
        primary:   '#FF3D6C',   // 메인 핑크 (deep)
        'primary-dark':  '#E81E54',
        'primary-light': '#FFE0E8',
        'primary-50':    '#FFF1F4',
        seller:  '#2ECC71',
        admin:   '#6C5CE7',
        // Neutrals (warm)
        background: '#FAF7F5',  // 따뜻한 오프화이트
        surface:    '#FFFFFF',
        border:     '#ECE7E2',
        'border-2': '#E2DCD6',
        ink:    '#0F0F12',      // 텍스트 (따뜻한 잉크 블랙)
        'ink-2': '#1F1F24',
        muted:  '#7A7077',      // 보조 텍스트
        'muted-2': '#A8A0A6',
        // legacy aliases (기존 코드 호환)
        'text-primary':   '#0F0F12',
        'text-secondary': '#7A7077',
        // Status
        error:  '#FF3B30',
        sage:   '#7B9A7A',
        butter: '#F4D26B',
        sky:    '#7CA8D9',
      },
    },
  },
  plugins: [],
};
