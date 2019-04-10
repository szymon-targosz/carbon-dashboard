const path = require('path');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = env => {
   const isProd = env === 'production';
   return {
      entry: ['@babel/polyfill', './src/js/index.js'],
      output: {
         path: path.resolve(__dirname, 'build'),
         filename: 'js/bundle.js'
      },
      mode: isProd ? 'production' : 'development',
      module: {
         rules: [
            {
               test: /\.js$/,
               exclude: /node_modules/,
               use: {
                  loader: 'babel-loader'
               }
            }, {
               test: /\.css$/,
               exclude: /node_modules/,
               use: [
                  {
                     loader: MiniCssExtractPlugin.loader
                  },
                  {
                     loader: 'css-loader',
                     options: {
                        importLoaders: 1,
                        sourceMap: true,
                     }
                  },
                  {
                     loader: 'postcss-loader',
                     options: {
                        ident: 'postcss',
                        plugins: () => [
                           autoprefixer({ browsers: ["> 1%", "last 2 versions, not ie < 9"] })
                        ]
                     }
                  }
               ]
            }
         ]
      },
      plugins: [
         new HtmlWebpackPlugin({
            template: `${__dirname}/src/index.html`,
            inject: true,
            filename: 'index.html',
         }),
         new CopyWebpackPlugin([
            { from: 'src/data', to: 'data' }
        ]),
         new MiniCssExtractPlugin({ filename: 'css/style.css' })
      ],
      devtool: isProd ? 'source-map' : 'inline-source-map'
   }
}