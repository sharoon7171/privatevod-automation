const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/background/service-worker.mjs',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'background/service-worker.mjs',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        type: 'javascript/auto',
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.html$/,
        use: 'html-loader'
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: 'manifest.json'
        },
        {
          from: 'src/content-scripts',
          to: 'content-scripts'
        },
        {
          from: 'src/pages',
          to: 'pages'
        },
        {
          from: 'src/templates',
          to: 'templates'
        },
        {
          from: 'src/styles',
          to: 'styles'
        },
        {
          from: 'src/ui',
          to: 'ui'
        },
        {
          from: 'src/core',
          to: 'core'
        },
        {
          from: 'src/controllers',
          to: 'controllers'
        },
        {
          from: 'src/services',
          to: 'services'
        },
        {
          from: 'src/functions',
          to: 'functions'
        },
        {
          from: 'src/utilities',
          to: 'utilities'
        },
        {
          from: 'src/assets',
          to: 'assets'
        }
      ]
    })
  ],
  resolve: {
    extensions: ['.mjs', '.js', '.json']
  },
  optimization: {
    minimize: false
  }
};
