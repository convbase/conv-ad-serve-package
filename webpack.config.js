const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/index.ts',  // Altere para o arquivo de entrada TypeScript
  output: {
    filename: 'ad-renderer.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'Convbase',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  resolve: {
    extensions: ['.ts', '.js']  // Resolve arquivos TypeScript e JavaScript
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  mode: 'production'
};
