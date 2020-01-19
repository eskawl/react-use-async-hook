const path = require('path');
const babelConfig = require('./babel.config');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: 'index.js',
        library: {
            root: 'ReactUseAsyncHook',
            amd: 'react-use-async-hook',
            commonjs: 'react-use-async-hook',
        },
        libraryTarget: 'umd',

        // Allow common-js to require directly
        // useAsync = require('react-use-async-hook')
        // rather than require('react-use-async-hook').default
        // https://github.com/webpack/webpack/issues/3929#issuecomment-423514570
        libraryExport: 'default',
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
