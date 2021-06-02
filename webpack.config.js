/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const path = require('path');
const webpack = require('webpack');
const WebpackConcatPlugin = require('webpack-concat-files-plugin');

const isDev = process.env.NODE_ENV !== 'production';
const config = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    mainFiles: ['index'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'lib'),
    publicPath: '/',
  },
  plugins: [
    new WebpackConcatPlugin({
      bundles: [
        {
          dest: './lib/src/types.d.ts',
          src: './src/**/*.d.ts',
        },
      ],
    }),
  ],
  devServer: {
    contentBase: './lib',
    hot: true,
  },
  optimization: {
    moduleIds: 'named',
  },
};
if (isDev) {
  config.mode = 'development';
  config.plugins.unshift(new webpack.HotModuleReplacementPlugin());
} else {
  config.mode = 'production';
}
module.exports = config;
