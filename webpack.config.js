const path = require('path');
const babelConfig = require('./babel.config');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: 'index.js',
        libraryTarget: 'commonjs2',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'src'),
                use: {
                    loader: 'babel-loader',
                    options: babelConfig,
                },
            },
        ],
    },
    externals: {
        react: 'react',
    },
    devtool: 'source-map',
    // resolve: {
    //     alias: {
    //         react: path.resolve('./node_modules/react')
    //     }
    // }
};
