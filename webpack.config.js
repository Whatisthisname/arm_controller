const path = require('path');

module.exports = {
  entry: './src/app.ts', // Entry point of your application
  output: {
    filename: 'bundle.js', // Output filename
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  resolve: {
    extensions: ['.ts', '.js'], // Specify the file extensions to resolve
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // Process .ts files
        use: 'ts-loader', // Use ts-loader to transpile TypeScript to JavaScript
        exclude: /node_modules/,
      },
    ],
  },
  devtool: 'source-map', // Generate source maps for debugging
};
