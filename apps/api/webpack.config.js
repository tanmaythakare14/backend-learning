const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = (config, { options }) => {
  config.output = {
    path: join(__dirname, '../../dist/apps/api'),
  };
  config.watch = options.watch;
  config.watchOptions = {
    ignored: ['**/node_modules/**', '**/.nx/**', '**/dist/**'],
  };
  config.plugins = [
    ...(config.plugins || []),
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ];
  return config;
};
