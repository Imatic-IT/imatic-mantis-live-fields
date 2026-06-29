const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? false : 'source-map',
  entry: {
    main: './src/index.tsx',
  },
  output: {
    path: path.resolve(__dirname, './files'),
    filename: 'index.js',
    // Lazily-loaded chunks. The public path is set at runtime in src/index.tsx
    // so these resolve through Mantis' plugin_file.php router; keep the filename
    // within the characters plugin_file.php allows ([A-Za-z0-9_.-]).
    chunkFilename: '[name].[contenthash].chunk.js',
    publicPath: '',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  optimization: isProduction
    ? {
      minimize: true,
      minimizer: [new TerserPlugin()],
    }
    : {},
  watch: !isProduction,
};
