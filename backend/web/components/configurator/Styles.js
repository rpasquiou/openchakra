import styled, {createGlobalStyle} from 'styled-components'


const MyGlobalStyle = createGlobalStyle`
 @font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  src: url('/static/assets/fonts/Roboto-Regular.ttf');
  src: local('Roboto'),
    url('/static/assets/fonts/Roboto-Regular.woff2') format('woff2'),
    url('/static/assets/fonts/Roboto-Regular.ttf') format('truetype');
}

:root {
  --brand-color: #182d45;
  --bg-blue-700: #2b3760;
  --bg-app: #f5f5f5;
  --bg-input: #f2f2f2;
  --text-input: #707070;
  --bg-selectedZone: #bcc0cd;
  --text-selectedZone: #fff;
  --text-gray-500: #747474;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
}

* {
  font-family: 'Roboto', Courier, monospace !important;
  color: black;
}

html {
  height: -webkit-fill-available;
}
body {
  padding: 0;
  margin: 0;
  min-height: 100vh;
}

/* Avoid Chrome to see Safari hack */
@supports (-webkit-touch-callout: none) {
  body {
    /* The hack for Safari */
    min-height: -webkit-fill-available;
  }
}
`


const Styles = styled.div`


.img-responsive {
  width: 100%;
  height: auto;
}

.max-w-md	{max-width: 28rem;}
.max-w-lg	{max-width: 32rem;} 

/* textes */

.text-sm {
  font-size: 0.875rem;
}
.text-base {
  font-size: var(--text-base);
}
.text-lg {
  font-size: var(--text-lg);
}
.text-xl {
  font-size: var(--text-xl);
}
.text-2xl {
  font-size: var(--text-2xl);
}
.text-3xl {
  font-size: var(--text-3xl);
}
.text-4xl {
  font-size: var(--text-4xl);
}

.text-gray-500 {
  color: var(--text-gray-500);
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

h1:nth-child(2) {
  margin-left: 1rem;
}

h2, h3 {
  font-size: 1.1rem !important;
}

.materialName {
  text-transform: lowercase;
}

.materialName:first-letter {
  text-transform: capitalize;
}

.asterixsm {
  color: red;
}

.configurator > *,
h2,
.MuiTypography-root {
  color: black !important;
}

.feurstconditions {
  font-style: italic;
  margin: 1rem;
}

.invisible {visibility: hidden;}

/* disposition */

.machine {
  grid-template-areas: 'machinetype' 'machineavert' 'machinebrand' 'machinemodel' 'machineweight' 'machinepower';
  grid-template-columns: 1fr;
}

.machine-type {
  grid-area: machinetype;
}

.machine-avert {
  grid-area: machineavert;
}

.machine-brand {
  grid-area: machinebrand;
}

.machine-model {
  grid-area: machinemodel;
}

.machine-power {
  grid-area: machinepower;
}

.machine-weight {
  grid-area: machineweight;
}

.grid {
  display: grid !important;
}

.grid-cols-1{
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-cols-1-2 {
  grid-template-columns: 1fr 2fr;
}

.col-span-2 {
  grid-column: span 2 / span 2;
}

.content-start {
  align-content: flex-start;
}
.content-between {
  align-content: space-between;
}

.flex {
  display: flex !important;
}

.flex-col {
  flex-direction: column;
}

.flex-column-reverse {
  flex-direction: column-reverse;
}

.flex-wrap {
  flex-wrap: wrap;
}

.grow	{
  flex-grow: 1;
}

.place-items-center {
  place-items: center;
}

.justify-center {
  justify-content: center;
}
.justify-evenly {
  justify-content: space-evenly;
}
.justify-between {
  justify-content: space-between;
}
.justify-end {
  justify-content: end;
}

.justify-self-end {
  justify-self: end;
}	

.items-center {
  align-items: center;
}

.items-end {
  align-items: end;
}

.gap-x-2 {
  column-gap: 0.5rem;
}

.gap-x-4 {
  column-gap: 1rem;
}

.gap-x-8 {
  column-gap: 4rem;
}

.gap-y-1 {
  row-gap: 0.25rem;
}

.gap-y-4 {
  row-gap: 1rem;
}

/* Positionnement */

.sticky {
  position: sticky;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.bottom-0 {
  bottom: 0;
}

.z-10 {
  z-index: 10;
}

.w-full {
  width: 100%;
}

.w-fit {width: fit-content;}

.h-full {
  height: 100%;
}

.max-w-350 {
  max-width: 350px;
}

/* Espacements */

.m-4 {
  margin: 1em;
}
.m-8 {
  margin: 2em;
}

.mx-auto {
  margin: 0 auto;
}

.mr-8 {
  margin-right: 2rem;
}

.mb-6 {
  margin-bottom: 1.5rem !important;
}

.ml-12 {
  margin-left: 3rem;
}

.p-2 {
  padding: 0.5rem;
}
.p-4 {
  padding: 1rem;
}
.pl-4 {
  padding-left: 1rem;
}
.pl-6 {
  padding-left: 1.5rem;
}

.px-1 {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

/* Inputs */

.machine input:checked ~ div {
  background: var(--bg-selectedZone);
  color: var(--text-selectedZone);
}

.beautifulSelect {
  background-color: bisque;
  color: black;
}

/* hack inputs */
.MuiLinearProgress-root {
  height: 24px !important;
}

.MuiLinearProgress-colorPrimary {
  background: #eaeaea !important;
}


.MuiLinearProgress-barColorPrimary {
  background: var(--brand-color) !important;
}

.MuiInputLabel-root {
  color: var(--text-input);
  z-index: 2;
}

.MuiSelect-root,
.MuiInputBase-root {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.MuiAccordion-root {
  box-shadow: none !important;
  margin-bottom: 1rem;
}

.MuiAccordion-root::before {
  content: none !important;
}

.MuiAccordionSummary-root {
  background-color: #f2f2f2 !important;
}

.MuiAccordionSummary-content {
  align-items: center;
  column-gap: 1rem;
}

.MuiAccordion-root.Mui-expanded {
  margin: 0 !important;
}

.MuiAccordionSummary-content.Mui-expanded,
.MuiAccordionSummary-content {
  margin: 0 !important;
}

/* Adornment bucketWidth */
#bucketWidth ~ .MuiInputAdornment-root {
  margin-right: 1.4rem;
}

/* Boutons */

/* Backgrounds */

.bg-white {
  background-color: #fff;
}

/* Arrondis */

.rounded-xl {
  border-radius: 0.75rem;
}

/* pseudo components */

.app-container {
  min-height: 33rem;
}

.infotext {
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 0.5em;
  border: 1px solid var(--brand-color);
  width: 2em;
  height: 2em;
  margin-right: .5rem;
  color: var(--brand-color);
}

.rounded-container {
  background: #fff;
  border-radius: 20px;
}

.whereami {
  display: none;
}

.previous,
.next {
  appearance: none !important;
  border: 1px solid var(--brand-color) !important;
  background: none !important;
  padding: 1rem 1.5rem !important;
  border-radius: 30px !important;
  min-width: 100px !important;
}

.previous:disabled,
.next:disabled {
  cursor: not-allowed !important;
  opacity: 0.5;
  pointer-events: all !important;
}

.next {
  background: var(--bg-blue-700) !important;
}

.next span {
  color: #fff !important;
}

.fixtypes input ~ div {
  border: 1px solid #707070;
}

.fixtypes input:focus ~ div {
  outline: 1px solid #707070;
  outline-offset: 3px;
}

.fixtypes input:checked ~ div {
  background: var(--bg-blue-700);
}

.fixtypes input:checked ~ div img {
  filter: invert(100%) sepia(100%) saturate(0%) hue-rotate(10deg) brightness(200%) contrast(100%);
}

.fixtypes input:checked ~ div span {
  color: #fff !important;
}


/* Last step */
.summary label {
  font-size: 1.1rem;
  padding-bottom: 0.4rem;
}

.summary .personaldata {
  margin: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  column-gap: 2rem;
  row-gap: 2rem;
}

.summary .recap {
  margin: 1rem;
}

.summary .recap h3{
  color: var(--text-gray-500);
  margin: 0;
  margin-bottom: .5rem;
}

.summary .recap p {
  margin: 0;
  margin-bottom: .5rem;
}

 
.summary .recap dl {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
} 

dd {
  margin-bottom: 0.2rem;
}

dl {
  margin: 0;
}

.dl-inline dt {
  float: left;
  clear: left;
  margin-right: 10px;
}
.dl-inline dd {
  margin-left: 0px;
}

.summary .personaldata > div {
  display: grid;
  align-content: baseline;
}

.summary .MuiSelect-root,
.summary .MuiInputBase-root {
  padding-left: 0;
  padding-top: 0;
  margin-top: .4em;
}


@media screen and (min-width: 768px) {
  .machine {
    grid-template-areas: 'machinetype machinetype' 'machineavert machineavert' 'machinebrand machinemodel' 'machineweight machinepower';
    grid-template-columns: repeat(2, 1fr);
  }

  .summary .personaldata {
    grid-template-columns: repeat(3, 1fr);
  }

  .summary .recap dl {
    grid-template-columns: max-content auto;
  }

  .md-gap-x-4 {
    column-gap: 1rem;
  }

  .md-gap-y-8 {
    row-gap: 4rem;
  }

  .md-grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .md-col-span-2 {
    grid-column: span 2 / span 2;
  }

  .md-flex-row {
    flex-direction: row;
  }

  .md-flex-wrap {
    flex-wrap: wrap;
  }

  .md-p-4 {
    padding: 1rem;
  }

  .md-m-4 {
    margin: 1rem;
  }

  .md-ml-12 {
    margin-left: 3rem !important;
  }
}

@media screen and (min-width: 1024px) {
  .lg-flex-row {
    flex-direction: row;
  }
}

@media screen and (min-width: 1280px) {
  body {
    background: none !important;
  }

  .xl-grid-cols-3 {
    grid-template-columns: 1fr 1fr 1fr;
  }

  .whereami {
    display: block;
    text-align: center;
  }

  .rounded-container {
    overflow: unset;
    max-height: unset;
  }

  .machine {
    grid-template-areas: '. machineavert machineavert' 'machinetype machinebrand machinemodel' 'machinetype machineweight machinepower';
    grid-template-columns: repeat(3, 1fr);
  }

  .previous,
  .next {
    font-size: 1.1rem !important;
    padding: 1rem 1.5rem !important;
    border-radius: 30px !important;
    min-width: 150px !important;
    text-transform: initial !important;
  }

  .contactexpert {
    justify-self: end;
  }

  /* hack input */

  .MuiInput-underline::before {
    border-bottom: 1px solid black !important;
  }

  .MuiSelect-root,
  .MuiInputBase-root {
    background: unset !important;
  }

  .MuiCollapse-root {
    height: auto !important;
  }

  .MuiCollapse-hidden {
    visibility: visible !important;
  }

  .MuiAccordionSummary-root {
    background: none !important;
  }

  .MuiAccordionSummary-expandIcon {
    display: none !important;
  }

  .MuiAccordionSummary-content {
    flex-direction: column;
  }
}

`

export {Styles, MyGlobalStyle}
