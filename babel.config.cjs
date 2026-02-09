module.exports = function (api) {
  const isTest = api.env('test');
  return {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      ['@babel/preset-react', { runtime: 'automatic' }],
    ],
    plugins: isTest
      ? [
          function () {
            return {
              visitor: {
                MetaProperty(path) {
                  path.replaceWithSourceString('process');
                },
              },
            };
          },
        ]
      : [],
  };
};
