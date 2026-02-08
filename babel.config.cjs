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
            // Replace import.meta with an object mimicking the env
            // This fixes "SyntaxError: Cannot use 'import.meta' outside a module" in Jest
            path.replaceWithSourceString('({ env: { DEV: true, VITE_API_BASE_URL: "http://localhost:8000/api/v1" } })');
          },
        },
      };
    },
  ],
};
