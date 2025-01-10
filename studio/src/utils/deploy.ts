import 'dotenv/config'
import lodash from 'lodash'
import { ProjectState } from '~/core/models/project'
import { PageSettings } from '../core/models/project';
import { build, copyFile, install, start, clean, sendTags } from './http'
import { generateCode, generateApp } from './code'
import { getPageUrl, normalizePageName, urlClean } from './misc';
import { validateComponents , validateProject} from './validation'

// If true, build target project when comilation fixed
// @ts-ignore
const TARGET_BUILD = ['production', 'validation'].includes(process.env.NEXT_PUBLIC_MODE) || false

console.log(`Starting in mode ${TARGET_BUILD}`)

const copyCode = (pageName: string, contents: Buffer) => {
  
  return copyFile({
    contents: contents,
    filePath: `${urlClean(pageName)}.js`,
  })
}

const cleanPages = (pages:PageSettings[]) => {
  return clean(pages.map(page => `${urlClean(page.pageName)}.js`))
}

export const deploy = (state: ProjectState, models: any) => {
  const pages = Object.values(state.pages)
  const deployMsg='*********** DEPLOY'
  console.time(deployMsg)
  const taggedPages=Object.values(state.pages).filter(page => !lodash.isEmpty(page.components?.root?.props?.tag))
    .map(page => ({tag: page.components.root.props.tag, url: '/'+getPageUrl(page.pageId, state.pages)}))
  return Promise.resolve(validateProject(state))
    .then(res => {
            if (res) {
        throw new Error(JSON.stringify(res, null, 2))
      }
      return Promise.all(
        pages.map(page => {
          return generateCode(page.pageId, state.pages, models, state)
            .catch(err => {
              console.error('generate pages while deploying', err)
              return Promise.reject(`Page "${page.pageName}":${err}`)
            })
        })
      )
    })
    .then(codes => {
      console.timeEnd(deployMsg)
      const namedCodes = lodash.zip(
        pages.map(nc => nc.pageName),
        codes,
      )
      return Promise.all(
        // @ts-ignore
        namedCodes.map(([pageName, code]) => copyCode(pageName, code)),
      )
    })
    .then(async() => {
      // generate again index
      const code = await generateCode(state.rootPage, state.pages, models, state)
        .catch(err => {
          console.error('generate index while deploying', err)
          return Promise.reject(`Page index :${err}`)
        })
      return code
    })
    .then(code => {
      // @ts-ignore
      return copyCode('index', code)
    })
    .then(() => {
      return cleanPages(pages)
    })
    .then(() => {
      return install()
    })
    // @ts-ignore
    .then(() => {
      return TARGET_BUILD ? build().then(() => start()) : true
    })
    .catch(err => {
      console.error(err)
      throw err
    })
}
