import { createTamagui, createTokens } from 'tamagui'
import { createInterFont } from '@tamagui/font-inter'
import { shorthands } from '@tamagui/shorthands'
import { themes, size, space, radius, zIndex, color } from '@tamagui/theme-base'
import { createMedia } from '@tamagui/react-native-media-driver'
import { animations } from './animations'
import {chakracolors} from 'app/assets/colors/chakracolors'


export const tokens = createTokens({
  size: {
    ...size,
    6: 64,
    $xs: 24,
    $md: 36,
    $lg: 48,
    $xl: 64,
  },
  space,
  radius,
  zIndex,
  color: {
    ...color,
    ...chakracolors,
    white: '#fff',
    black: '#000',
  },
})

export const breakpoints = {
  base: { minWidth: 0},
  xs: { minWidth: 320 },
  sm: { minWidth: 480 },
  md: { minWidth: 768 },
  lg: { minWidth: 992 },
  xl: { minWidth: 1280 },
  '2xl': { minWidth: 1536 },
}

const headingFont = createInterFont({
  size: {
    6: 15,
  },
  transform: {
    6: 'uppercase',
    7: 'none',
  },
  weight: {
    6: '400',
    7: '700',
  },
  color: {
    6: '$colorFocus',
    7: '$color',
  },
  letterSpacing: {
    5: 2,
    6: 1,
    7: 0,
    8: -1,
    9: -2,
    10: -3,
    12: -4,
    14: -5,
    15: -6,
  },
  face: {
    700: { normal: 'InterBold' },
  },
})

const bodyFont = createInterFont(
  {
    face: {
      700: { normal: 'InterBold' },
    },
  },
  {
    sizeSize: (size) => Math.round(size * 1.1),
    sizeLineHeight: (size) => Math.round(size * 1.1 + (size > 20 ? 10 : 10)),
  }
)

const config = createTamagui({
  animations,
  // shouldAddPrefersColorThemes: true,
  // themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  tokens,
  themes,
  media: createMedia({
    ...breakpoints,
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  }),
})


export type Conf = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

export {config}
