export default {
    plugins: [
        ["@snowpack/plugin-webpack"]
    ],
    optimize: {
        bundle: true,
        minify: true,
        target: 'es2018',
    },
    // mount: {
    //     "./lib/iconfont/fonts": {
    //         url: "/lib/iconfont/fonts",
    //         static: true
    //     }
    // }
};