module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [
    function() {
      return {
        visitor: {
          MetaProperty(path) {
            path.replaceWithSourceString('({ env: { DEV: true, VITE_API_BASE_URL: "http://127.0.0.1:8000/api/v1" } })');
          }
        }
      }
    }
  ]
};
