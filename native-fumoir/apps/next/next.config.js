const { withExpo } = require('@expo/next-adapter')
const withFonts = require('next-fonts')
const withImages = require('next-images')
const { join } = require('path')
const { withTamagui } = require('@tamagui/next-plugin')
const withPlugins = require('next-compose-plugins')
const withTM = require('next-transpile-modules')([
  'app',
  'solito',
  'react-native-web',
  'expo-linking',
  'expo-constants',
  'expo-modules-core',
])

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    disableStaticImages: true,
  },
  reactStrictMode: false,
  webpack5: true,
  images: {
    disableStaticImages: true,
  },
  experimental: {
    // forceSwcTransforms: true, // set this to true to use reanimated + swc experimentally
    scrollRestoration: true,
    legacyBrowsers: false,
  },
}

process.env.IGNORE_TS_CONFIG_PATHS = 'true'
process.env.TAMAGUI_TARGET = 'web'
process.env.TAMAGUI_DISABLE_WARN_DYNAMIC_LOAD = '1'
// 
// TAMAGUI_ENABLE_DYNAMIC_LOAD=1 

const boolVals = {
  true: true,
  false: false,
}

const disableExtraction =
  boolVals[process.env.DISABLE_EXTRACTION] ?? process.env.NODE_ENV === 'development'

console.log(`

Welcome to Tamagui!

You can update this monorepo to the latest Tamagui release just by running:

yarn upgrade:tamagui

We've set up a few things for you.

See the "excludeReactNativeWebExports" setting in next.config.js, which omits these
from the bundle: Switch, ProgressBar Picker, CheckBox, Touchable. To save more,
you can add ones you don't need like: AnimatedFlatList, FlatList, SectionList,
VirtualizedList, VirtualizedSectionList.

Even better, enable "useReactNativeWebLite" and you can remove the
excludeReactNativeWebExports setting altogether and get tree-shaking and
concurrent mode support as well.

🐣

Remove this log in next.config.js.

`)


module.exports = withPlugins(
  [
    withTM,
    withFonts,
    withImages,
    [
      withExpo,
      {
        projectRoot: __dirname + '../../..',
      },
    ],
    withTamagui({
      config: './tamagui.config.ts',
      components: ['tamagui', '@my/ui'],
      importsWhitelist: ['constants.js', 'colors.js'],
      logTimings: true,
      disableExtraction,
      // experiment - reduced bundle size react-native-web
      useReactNativeWebLite: false,
      shouldExtract: (path) => {
        if (path.includes(join('packages', 'app'))) {
          return true
        }
      },
      excludeReactNativeWebExports: ['Switch', 'ProgressBar', 'CheckBox', 'Touchable'],
    }),
  ],
  nextConfig
)
