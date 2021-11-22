const path = require('path')

module.exports = {
  target: "webworker",
  entry: "./src/index.ts",
  mode: 'production',
  output: {
    filename: 'worker.js',
    path: path.join(__dirname, 'dist'),
  },
  externals: [
    { 'cross-fetch': 'fetch' }
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          // transpileOnly is useful to skip typescript checks occasionally:
          // transpileOnly: true,
        },
      },
    ],
  },
}
