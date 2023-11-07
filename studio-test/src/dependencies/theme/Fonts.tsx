import React from 'react'
import { Global } from '@emotion/react'

const Fonts = () => (
  <Global
    styles={`
      /* latin */
      @font-face {
        font-family: Tomarik;
        src: local('Tomarik Display Line'), local('Tomarik-Display-Line'),
            url('fonts/Tomarik-DisplayLine.woff2') format('woff2'),
            url('fonts/Tomarik-DisplayLine.woff') format('woff'),
            url('fonts/Tomarik-DisplayLine.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: Radikal;
        src: local('Radikal'), local('Radikal Bold'),
            url('fonts/Radikal-Bold.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'Radikal Thin';
        src: local('Radikal Thin'), local('Radikal-Thin'),
            url('fonts/Radikal-Thin.woff') format('woff');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'Futura';
        src: local('Futura'),
            url('fonts/Futura-medium.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'Digital-7';
        src: local('digital 7'), local('digital-7'),
            url('fonts/digital-7.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'Cabin';
        src: local('Cabin'),
            url('fonts/Cabin-Regular.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'Cabin';
        src: local('Cabin'),
            url('fonts/Cabin-Bold.ttf') format('truetype');
        font-weight: bold;
        font-style: normal;
      }
      @font-face {
        font-family: 'DancingScript';
        src: local('DancingScript'),
            url('fonts/DancingScript-Regular.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'DancingScript';
        src: local('DancingScript'),
            url('fonts/DancingScript-Bold.ttf') format('truetype');
        font-weight: bold;
        font-style: normal;
      }
      @font-face {
        font-family: 'Playfair Display';
        src: local('Playfair Display'),
            url('fonts/PlayfairDisplay-regular.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }

      /* Fontes all-inclusive */
      @font-face {
        font-family: 'Crapaud';
        src: local('Crapaud'),
            url('fonts/crapaud_petit.ttf') format('truetype');
        font-weight: lighter;
        font-style: normal;
      }
      @font-face {
        font-family: 'Crapaud';
        src: local('Crapaud'),
            url('fonts/crapaud_gros.ttf') format('truetype');
        font-weight: bold;
        font-style: normal;
      }
      @font-face {
        font-family: 'berthold-akzidenz';
        src: local('berthold-akzidenz-grotesk'),
            url('fonts/berthold-akzidenz-grotesk.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'berthold-akzidenz condensed';
        src: local('berthold-akzidenz-grotesk condensed'),
            url('fonts/berthold-akzidenz-grotesk-be-condensed.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
      }
      /* Fontes klesia */
      @font-face {
        font-family: 'Lato';
        src: local('Lato'),
            url('fonts/Lato-Regular.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'Univers LT Std';
        src: local('Univers LT Std'),
            url('fonts/Univers LT Std 55 Roman.otf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'Univers LT Std';
        src: local('Univers LT Std'),
            url('fonts/Univers LT Std 45 Light.otf') format('truetype');
        font-weight: lighter;
        font-style: normal;
      }
      @font-face {
        font-family: 'Helvetica';
        src: local('Helvetica'),
            url('fonts/Helvetica.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'Pilcrow rounded';
        src: local('Pilcrow rounded'),
            url('fonts/PilcrowRounded-Semibold.ttf') format('truetype');
        font-weight: lighter;
        font-style: normal;
      }
      `}
  />
)

export const fontsName = [
  'Crapaud',
  'Lato',
  'Univers LT Std',
  'Helvetica',
  'Pilcrow rounded',
  'berthold-akzidenz',
  'berthold-akzidenz condensed'
]

export default Fonts
