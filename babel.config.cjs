module.exports = function(api) {
  const isTest = api.env('test');

  const plugins = [];

  if (isTest) {
    plugins.push(function () {
      return {
        visitor: {
          MetaProperty(path) {
            path.replaceWithSourceString('({ env: { VITE_API_BASE_URL: "http://127.0.0.1:8000/api/v1", DEV: true } })');
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
    plugins,
  };
};
