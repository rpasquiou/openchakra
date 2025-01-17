const WebpackBar = require('webpackbar')

module.exports = {
  webpack: (config, {isServer}) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.node = {
        fs: 'empty',
      }
    }
    config.module.rules.push({
      test: /\.(png|jp(e*)g|gif|svg|ttf|woff2)$/,
      exclude: /(node_modules)/,
      loader: require.resolve('url-loader'),
    })

    config.plugins.push(
      new WebpackBar({
        fancy: true,
        profile: true,
        basic: false,
      }),
    )

    return config
  },
}
