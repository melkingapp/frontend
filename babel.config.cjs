module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [
    ['babel-plugin-transform-define', {
      'import.meta.env.DEV': true,
      'import.meta.env.PROD': false,
      'import.meta.env.SSR': false,
      'import.meta.env.VITE_API_BASE_URL': 'http://127.0.0.1:8000/api/v1',
      'import.meta.env.VITE_MEDIA_BASE_URL': 'http://127.0.0.1:8000',
    }],
  ],
};
