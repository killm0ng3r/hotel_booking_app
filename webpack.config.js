const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    app: './src/app.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    clean: true // Cleans the dist folder before each build
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['app']
    }),
    new HtmlWebpackPlugin({
      template: './src/booking.html',
      filename: 'booking.html',
      chunks: ['app']
    }),
    new HtmlWebpackPlugin({
      template: './src/rooms.html',
      filename: 'rooms.html',
      chunks: ['app']
    }),
    new HtmlWebpackPlugin({
      template: './src/admin.html',
      filename: 'admin.html',
      chunks: ['app']
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/images', to: 'images' }
      ]
    })
  ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080,
    historyApiFallback: false // Disable SPA routing since we have multiple HTML files
  }
};