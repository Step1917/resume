/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/explicit-function-return-type */
const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');
const { ContextReplacementPlugin } = require('webpack');
const Dotenv = require('dotenv-webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
/* eslint-enable @typescript-eslint/no-var-requires */

module.exports = (env, options) => {
  const isDevMode = options.mode === 'development';
  const dist = path.join(__dirname, 'dist');
  const src = path.join(__dirname, 'src');
  const port = 8000;
  const host = (() => {
    if (options.network) {
      return options.network === true ? '192.168.1.83' : options.network;
    }
    return 'localhost';
  })();

  return {
    stats: 'minimal',
    context: src,
    entry: './index.tsx',
    output: {
      path: dist,
      publicPath: isDevMode ? `http://${host}:${port}/` : 'https://frontend.lvrtx.com/',
      filename: `js/[name]${isDevMode ? '' : '.[contenthash]'}.js`,
      chunkFilename: `js/[name]${isDevMode ? '' : '.[contenthash]'}.js`,
    },
    devtool: isDevMode && 'source-map',
    devServer: {
      host,
      port,
      hot: true,
      historyApiFallback: true,
      overlay: true,
    },
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src'),
      },
      modules: [src, 'node_modules'],
      extensions: ['.tsx', '.ts', '.js'],
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
      },
    },
    optimization: {
      minimize: !isDevMode,
      minimizer: isDevMode
        ? [
            new TerserPlugin({
              parallel: true,
            }),
          ]
        : [
            new TerserPlugin({
              parallel: true,
              terserOptions: {
                output: {
                  comments: false,
                },
              },
              extractComments: false,
            }),
          ],
    },
    plugins: [
      new CircularDependencyPlugin({
        exclude: /node_modules/,
      }),
      new Dotenv({
        path: isDevMode ? './.env.dev' : './.env.stage',
      }),
      new ContextReplacementPlugin(/moment[/\\]locale$/, /ru|en/),
      new BundleAnalyzerPlugin(),
      new CleanWebpackPlugin(),
      new HtmlPlugin({
        template: 'index.html',
        minify: {
          removeComments: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
        inject: true,
      }),
      new MiniCssExtractPlugin({
        ignoreOrder: true,
        filename: 'css/[name].[contenthash].css',
        chunkFilename: 'css/[name].[contenthash].css',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: ['cache-loader', 'ts-loader'],
          include: src,
          exclude: /node_modules/,
        },
        {
          test: /\.s([aс])ss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]_[local]-[hash:base64:5]',
                },
              },
            },
            'postcss-loader',
            'sass-loader',
          ],
        },
        {
          test: /\.less$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            'css-loader',
            'postcss-loader',
            {
              loader: 'less-loader',
              options: {
                sourceMap: isDevMode,
                lessOptions: {
                  javascriptEnabled: true,
                  modifyVars: {
                    'primary-color': '#0081D1',
                    'border-radius-base': '4px',
                  },
                },
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: ['cache-loader', 'babel-loader'],
          include: src,
        },
        {
          test: /\.(png|gif|jpe?g)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].[ext]',
              },
            },
            'img-loader',
          ],
        },
        {
          test: /\.(mp3)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].[ext]',
              },
            },
          ],
        },
        {
          test: /\.svg$/,
          use: ['url-loader'],
        },
        {
          test: /\.(woff2?|oet|([to]tf))$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].[ext]',
              },
            },
          ],
        },
      ],
    },
  };
};
