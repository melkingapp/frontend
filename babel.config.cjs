module.exports = function(api) {
  // Cache the configuration based on the environment
  api.cache(true);

  const isTest = process.env.NODE_ENV === 'test';

  const plugins = [];

  // Only mock import.meta.env in test environment
  if (isTest) {
    plugins.push(function () {
      return {
        visitor: {
          MetaProperty(path) {
            path.replaceWithSourceString('({ env: { DEV: true, VITE_API_BASE_URL: "http://127.0.0.1:8000/api/v1" } })');
          },
        },
      };
    });
  }

  return {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      ['@babel/preset-react', { runtime: 'automatic' }],
    ],
    plugins: plugins,
  };
};
