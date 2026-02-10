module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [
    function () {
      return {
        visitor: {
          MetaProperty(path) {
            path.replaceWithSourceString('({ env: { DEV: true, PROD: false, MODE: "test", VITE_API_BASE_URL: "http://localhost:8000/api/v1" } })');
          },
        },
      };
    },
  ],
};
