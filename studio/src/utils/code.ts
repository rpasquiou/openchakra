import moment from 'moment'
import {encode} from 'html-entities'
import filter from 'lodash/filter'
import isBoolean from 'lodash/isBoolean'
import lodash from 'lodash'
import icons from '~iconsList'
import lucidicons from '~lucideiconsList'

import {
  ACTION_TYPE,
  CHECKBOX_TYPE,
  CONTAINER_TYPE,
  DATE_TYPE,
  EXPANDABLE_TYPE,
  GROUP_TYPE,
  IMAGE_TYPE,
  INPUT_TYPE,
  PROGRESS_TYPE,
  SELECT_TYPE,
  SOURCE_TYPE,
  TEXT_TYPE,
  UPLOAD_TYPE,
  computeDataFieldName,
  getChildrenOfType,
  getDataProviderDataType,
  getFieldsForDataProvider,
  getLimitsForDataProvider,
  getParentOfType,
  hasParentType,
  isSingleDataPage,
} from './dataSources';
import {
  DEFAULT_REDIRECT_PAGE,
  REDIRECT_COUNT,
  REDIRECT_PAGE,
  REDIRECT_ROLE,
  addBackslashes,
  capitalize,
  getPageFileName,
  getPageUrl,
  normalizePageName,
  whatTheHexaColor,
} from './misc';
import { ProjectState, PageState } from '../core/models/project'
import { isJsonString } from '../dependencies/utils/misc'


//const HIDDEN_ATTRIBUTES=['dataSource', 'attribute']
const HIDDEN_ATTRIBUTES: string[] = []

export const getPageComponentName = (
  pageId: string,
  pages: { [key: string]: PageState },
) => {
  return normalizePageName(pages[pageId].pageName)
}

const isDynamicComponent = (components:IComponents, comp: IComponent): boolean => {
  let isDynamic=(!!comp.props.dataSource || !!comp.props.subDataSource
    || (!!comp.props.action && !CONTAINER_TYPE.includes(comp.type))
    || (comp.props.model && comp.props.attribute)) && !(comp.type=='Flex' && comp.props.isFilterComponent)
  // Tabs: has dataSource but only TabList and TabPanels children must get the datasource
  if (comp.type=='Tabs') {
    return false
  }
  if (comp.type=='AccordionItem') {
    return true
  }
  if (['TabList', 'TabPanels'].includes(comp.type)) {
    const tabParent=getParentOfType(components, comp, 'Tabs')
    return tabParent ? tabParent.props.dataSource : false
  }
  return isDynamic
}

const isMaskableComponent = (comp: IComponent) => {
  return !!comp.props.hiddenRoles || !!comp.props.conditionsvisibility
}

const getDynamicType = (comp: IComponent) => {
  if (CONTAINER_TYPE.includes(comp.type)) {
    return 'Container'
  }
  if (TEXT_TYPE.includes(comp.type)) {
    return 'Text'
  }
  if (IMAGE_TYPE.includes(comp.type)) {
    return 'Image'
  }
  if (ACTION_TYPE.includes(comp.type)) {
    return 'Button'
  }
  if (PROGRESS_TYPE.includes(comp.type)) {
    return 'Value'
  }
  if (DATE_TYPE.includes(comp.type)) {
    return 'Date'
  }
  if (SELECT_TYPE.includes(comp.type)) {
    return 'Select'
  }
  if (SOURCE_TYPE.includes(comp.type)) {
    return 'Source'
  }
  if (CHECKBOX_TYPE.includes(comp.type)) {
    return ['IconCheck','Switch'].includes(comp.type) ? 'Checkbox': comp.type
  }
  if (INPUT_TYPE.includes(comp.type)) {
    return 'Input'
  }
  if (UPLOAD_TYPE.includes(comp.type)) {
    return 'UploadFile'
  }
  if (EXPANDABLE_TYPE.includes(comp.type)) {
    return 'Expandable'
  }
  if (GROUP_TYPE.includes(comp.type)) {
    return comp.type
  }
  return null
  throw new Error(`No dynamic found for ${comp.type}`)
}

export const formatCode = async (code: string) => {
  let formattedCode = `// 🚨 Your props contains invalid code`

  const prettier = await import('prettier/standalone')
  const babylonParser = await import('prettier/parser-babylon')

  formattedCode = prettier.format(code, {
    parser: 'babel',
    plugins: [babylonParser],
    semi: false,
    singleQuote: true,
  })

  return formattedCode
}

type BuildBlockParams = {
  component: IComponent
  components: IComponents
  forceBuildBlock?: boolean
  pages: { [key: string]: PageState }
  models: any,
  singleDataPage: boolean,
  noAutoSaveComponents: string[]
}

// Wether component is linked to a save action, thus must not save during onChange
const getNoAutoSaveComponents = (components: IComponents): IComponent[] => {
  let c=Object.values(components)
    .filter(c => ['save', 'create', 'smartdiet_set_company_code'].includes(c.props?.action) && c.props?.actionProps)
    .map(c => JSON.parse(c.props.actionProps))
  c=c.map(obj => lodash.pickBy(obj, (_, k)=> /^component_|^code$/.test(k)))
  c=c.map(obj => Object.values(obj).filter(v => !!v))
  c=lodash.flattenDeep(c)
  c=lodash.uniq(c)
  return c
}

const buildBlock = ({
  component,
  components,
  forceBuildBlock = false,
  pages,
  models,
  singleDataPage,
  noAutoSaveComponents
}: BuildBlockParams) => {
  let content = ''
  const singleData=isSingleDataPage(components)
  component.children.forEach((key: string) => {
    let child = components[key]
    if (child.type === 'DataProvider') {
      return
    }
    if (!child) {
      throw new Error(`invalid component ${key}`)
    } else if (forceBuildBlock || !child.componentName) {

      const childComponent={
        ...lodash.cloneDeep(child),
        props: lodash.cloneDeep(child.type=='Tabs' ? lodash.omit(child.props, ['dataSource']) : child.props),
      }

      // Don't insert TabList if the parent Tabs is a wizard
      if (childComponent.type=='TabList' && component.props.isWizard?.toString()=='true') {
        return
      }

      // Force TabList && TabPanel's dataSource if parent Tabs has one
      if (['TabList', 'TabPanels'].includes(childComponent.type)) {
        const tabParent=getParentOfType(components, childComponent, 'Tabs')
        if (tabParent?.props.dataSource) {
          childComponent.props.dataSource=tabParent?.props.dataSource
        }
        if (tabParent?.props.attribute) {
          childComponent.props.attribute=tabParent?.props.attribute
        }
        if (tabParent?.props.hidePagination) {
          childComponent.props.hidePagination=tabParent?.props.hidePagination
        }
        if (tabParent?.props.limit) {
          childComponent.props.limit=tabParent?.props.limit
        }
      }
      const dataProvider = components[childComponent.props.dataSource]
      const isDpValid=getValidDataProviders(components).find(dp => dp.id==childComponent.props.dataSource)
      const paramProvider = dataProvider?.id.replace(/comp-/, '')
      const subDataProvider = components[childComponent.props.subDataSource]
      const paramSubProvider = subDataProvider?.id.replace(/comp-/, '')
      const componentName = isDynamicComponent(components, childComponent)
        ? `Dynamic${capitalize(childComponent.type)}`
        : isMaskableComponent(childComponent)
        ? `Maskable${capitalize(childComponent.type)}`
        : (childComponent.type==='Flex' && JSON.parse(childComponent?.props?.isFilterComponent || 'false'))
        ? 'Filter'
        : capitalize(getWappType(childComponent.type))
      let propsContent = ''

      propsContent += ` getComponentValue={getComponentValue} `

        propsContent += ` setComponentValue={setComponentValue} `
      // }

      propsContent += ` getComponentAttribute={getComponentAttribute} `

      if (getDynamicType(childComponent)=='Container' && childComponent.props.dataSource) {
        propsContent += ` fullPath="${computeDataFieldName(childComponent, components, childComponent.props.dataSource) || ''}"`
        propsContent += ` pagesIndex={pagesIndex} `
        propsContent += ` setPagesIndex={setPagesIndex} `
      }
      // Handle wizard
      if (childComponent.type=='Tabs') {
        const tabPanels=getChildrenOfType(components, childComponent, 'TabPanel')
        propsContent += ` childPanelCount={${tabPanels.length}}`
      }
      // Handle Wizard buttons
      if (childComponent.type=='Button' && ['PREVIOUS', 'NEXT', 'FINISH'].includes(childComponent.props?.tag)) {
        const tab=getParentOfType(components, component, 'Tabs')
        propsContent+= ` parentTab={'${tab.id}'}`
        const tabPanels=getChildrenOfType(components, tab, 'TabPanel')
        propsContent += ` parentTabPanelsCount={${tabPanels.length}}`
      }
      // Set component id
      propsContent += ` id='${childComponent.id}' `
      // Set reload function
      propsContent += ` reload={reload} `
      // Provide page data context
      if (dataProvider && isDpValid) {
        if (singleDataPage) {
          propsContent += ` context={root?._id}`
        }
        else {
          propsContent += ` context={root?.[0]?._id}`
        }
      }

      if (noAutoSaveComponents.includes(childComponent.id)) {
        propsContent += ` noautosave={true} `
      }

      if (['Checkbox', 'IconCheck', 'Radio'].includes(childComponent.type) && hasParentType(childComponent, components, 'RadioGroup')) {
        propsContent += ` insideGroup `
      }
      if (['Checkbox', 'IconCheck', 'Radio'].includes(childComponent.type) && hasParentType(childComponent, components, 'CheckboxGroup')) {
        propsContent += ` insideGroup `
      }
      if (isDynamicComponent(components, childComponent)) {
          let tp = null
            try {
              tp =getDataProviderDataType(
            components[childComponent.parent],
            components,
            childComponent.props.dataSource,
            models,
          )
        } catch (err) {
          console.error(err)
        }
          if (!tp) {
            try {
            tp = {
              type: components[childComponent.props.dataSource].props.model,
              multiple: true,
              ref: true,
            }
          } catch (err) {
            console.error(err)
          }
          }

          if (((childComponent.props.dataSource && tp?.type) || childComponent.props.model) && childComponent.props?.attribute) {
            const att=models[tp?.type || childComponent.props.model].attributes[childComponent.props?.attribute]
            if (att?.enumValues && (childComponent.type!='RadioGroup' || lodash.isEmpty(childComponent.children))) {
              propsContent += ` enum='${encode(JSON.stringify(att.enumValues))}'`
            }
            if (att?.suggestions) {
              propsContent += ` suggestions='${JSON.stringify(att.suggestions)}'`
            }
            // TODO Solene: have to remove this : att must exist
            if (!!att?.multiple) {
              propsContent += ` isMulti `
            }
          }
          if (tp?.type) {
            propsContent += ` dataModel='${tp.type}' `
          } else {
            console.error(
              `No data provider data type found for ${childComponent.parent}`,
            )
          }
      }
      // Set if dynamic container
      if (
        (CONTAINER_TYPE.includes(childComponent.type) ||
          SELECT_TYPE.includes(childComponent.type)) &&
        !!dataProvider
      ) {
        propsContent += ` dynamicContainer `
      }

      const propsNames = Object.keys(childComponent.props).filter(propName => {
        if (childComponent.type === 'Icon') {
          return propName !== 'icon'
        }
        // No index on Accordion => Unfolded by defautl
        if (childComponent.type === 'Accordion') {
          return propName !== 'index'
        }
        return true
      })

      propsNames
        .filter(p => !HIDDEN_ATTRIBUTES.includes(p))
        .forEach((propName: string) => {
          const val = childComponent.props[propName]
          const propsValue =
            val !== null && isJsonString(val) ? JSON.parse(val) : val
          const propsValueAsObject =
            typeof propsValue === 'object' && val !== null // TODO revise this temporary fix = propsValue !== 'null' // bgGradient buggy when deleted

          if (propName === 'actionProps' || propName === 'nextActionProps') {
            const valuesCopy = {
              ...propsValue,
              page: propsValue.page
                ? getPageUrl(propsValue.page, pages)
                : undefined,
              redirect: propsValue.redirect
                ? getPageUrl(propsValue.redirect, pages)
                : undefined,
              paymentSuccess: propsValue.paymentSuccess
                ? getPageUrl(propsValue.paymentSuccess, pages)
                : undefined,
              paymentFailure: propsValue.paymentFailure
                ? getPageUrl(propsValue.paymentFailure, pages)
                : undefined,
            }
            propsContent += ` ${propName}='${JSON.stringify(valuesCopy)}'`
            return
          }

          if (propName === 'dataSource') {
            if (!isDpValid) {
              return
            }
            propsContent += ` dataSourceId={'${propsValue}'}`
            if (propsValue) {propsContent += ` key={${propsValue.replace(/^comp-/, '')}${singleData? '': '[0]'}?._id}`}
          }

          const hasPopup=childComponent.props?.popup===true || childComponent.props?.popup=='true'
          if (propName === 'display' && hasPopup) {
            return
          }

          if (propName === 'popup' && hasPopup) {
            propsContent += ' display="none"'
          }

          if (['action', 'nextAction'].includes(propName) && val=='close_popup') {
            let component=childComponent
            while (component) {
              if (component.props?.popup===true || component.props?.popup==='true') {
                break
              }
              if (component.id=='root') {
                break
              }
              component=components[component.parent]
            }
            if (component?.props.popup) {
              propsContent += ` ${propName}Props='{"popup":"${component.id}"}' `
            }
            else {
              throw new Error(`${childComponent.type} ${childComponent.id} parent popup not found`)
            }
          }
          if (propName === 'subDataSource') {
            propsContent += ` subDataSourceId={'${propsValue}'}`
          }

          if (propName === 'contextFilter') {
            if (propsValue) {
              propsContent += ` contextFilter={${propsValue.replace(
                /^comp-/,
                '',
              )}}`
            }
            return
          }

          if (propName === 'hiddenRoles') {
            propsContent += ` hiddenRoles='${JSON.stringify(propsValue)}'`
            propsContent += ` user={user} `
            return
          }

          if (propName === 'filterValue') {
            propsContent += ` upd={componentsValues} `
          }

          if (propName === 'textFilter' && !!propsValue) {
            const compKey = propsValue.replace(/^comp-/, '')
            propsContent += ` textFilter={${compKey}}`
            return
          }

          if (/^conditions/.test(propName)) {
            propsContent += ` ${propName}={${JSON.stringify(propsValue)}}`
            return
          }

          if (propsValueAsObject && Object.keys(propsValue).length >= 1) {
            const gatheredProperties = Object.entries(propsValue)
              .map(([prop, value]) => {
                return ` '${prop}': '${value}' `
              })
              .join(', ')

            propsContent += `${propName}={{${gatheredProperties}}} `
          } else if (
            propName.toLowerCase().includes('icon') &&
            childComponent.type !== 'Icon'
          ) {
            const iconSets = {...icons, ...lucidicons}
            if (Object.keys(iconSets).includes(propsValue)) {
              const {color, fill} = childComponent.props
              const iconColor = whatTheHexaColor(color || 'black')
              const fillIconColor = whatTheHexaColor(fill || 'black')

              let operand = `={<${propsValue} color={'${iconColor}'} ${fill ? `fill={'${fillIconColor}'}` : ''} />}`
              propsContent += `${propName}${operand} `
            }
          } else if (
            propName !== 'children' &&
            typeof propsValue !== 'object' &&
            (propsValue || propsValue===0)
          ) {
            let operand =
              (propName === 'dataSource' && paramProvider)
                ? `={${paramProvider}}`
                :
                propName === 'subDataSource' && paramSubProvider
                  ? `={${paramSubProvider}}`
                : `='${propsValue===0 ? '0' : encode(propsValue)}'`

            if (propsValue === true || propsValue === 'true') {
              operand = ` `
            } else if (
              childComponent.type!='Radio' &&
              (propsValue === 'false' ||
              isBoolean(propsValue) ||
              !isNaN(propsValue) )
            ) {
              operand = `={${propsValue}}`
            }

            if (propName=='href') {
              operand=`="${getPageUrl(propsValue, pages)}"`
            }

            if (['color', 'fill'].includes(propName)) {
              operand=`="${whatTheHexaColor(propsValue)}"`
            }

            propsContent += ` ${propName}${operand}`
          }
        })

      // Access to fire clear and clear notification
      propsContent += " fireClearComponents={fireClearComponents} "
      propsContent += " clearComponents={clearComponents} "
      if (isFilterComponent(childComponent, components)) {
        propsContent += ` isfilter`
      }

      if (childComponent.type === 'Input' && childComponent.props.type=='password') {
        propsContent += ` displayEye`
      }

      if (childComponent.type === 'Flex' && childComponent.props.isFilterComponent) {
        const {props}=childComponent
        const enums=models[props?.model]?.attributes?.[props.attribute]?.enumValues
        if (enums) {
          propsContent += ` enumValues='${JSON.stringify(enums)}'`
        }
      }

      if (
        typeof childComponent.props.children === 'string' &&
        childComponent.children.length === 0
      ) {
        content += `<${componentName} ${propsContent}>${childComponent.props.children}</${componentName}>`
      } else if (childComponent.type === 'Icon') {
        content += `<${childComponent.props.icon} ${propsContent} />`
      } else if (childComponent.children.length) {
        content += `<${componentName} ${propsContent}>
      ${buildBlock({
        component: childComponent,
        components,
        forceBuildBlock,
        pages,
        models,
        singleDataPage,
        noAutoSaveComponents,
      })}
      </${componentName}>`
      } else {
        content += `<${componentName} ${propsContent}  />`
      }
    } else {
      content += `<${childComponent.componentName} />`
    }
  })

  return content
}

const buildComponents = (
  components: IComponents,
  pages: { [key: string]: PageState },
  singleDataPage: boolean,
  noAutoSaveComponents: string[]
) => {
  const codes = filter(components, comp => !!comp.componentName).map(comp => {
    return generateComponentCode({
      component: { ...components[comp.parent], children: [comp.id] },
      components,
      forceBuildBlock: true,
      componentName: comp.componentName,
      pages,
      singleDataPage,
      noAutoSaveComponents
    })
  })

  return codes.reduce((acc, val) => {
    return `
      ${acc}

      ${val}
    `
  }, '')
}

type GenerateComponentCode = {
  component: IComponent
  components: IComponents
  componentName?: string
  forceBuildBlock?: boolean
  pages: { [key: string]: PageState }
  models: any[],
  singleDataPage: boolean,
  noAutoSaveComponents: string[]
}

export const generateComponentCode = ({
  component,
  components,
  componentName,
  forceBuildBlock,
  pages,
  models,
  singleDataPage,
  noAutoSaveComponents
}: GenerateComponentCode) => {
  let code = buildBlock({
    component,
    components,
    forceBuildBlock,
    pages,
    models,
    singleDataPage,
    noAutoSaveComponents,
  })

  code = `
const ${componentName} = () => (
  ${code}
)`

  return code
}

const getIconsImports = (components: IComponents, lib?: string | null) => {
  return Object.keys(components).flatMap(name => {
    return Object.keys(components[name].props)
      .filter(prop => prop.toLowerCase().includes('icon'))
      .filter(() => {
        if (components[name].props?.['data-lib']) {
          return components[name].props?.['data-lib'].includes(lib ?? "chakra")
        } else {
          return !lib
        }
      })
      .filter(prop => !!components[name].props[prop])
      .map(prop => components[name].props[prop])
  })
}

const buildFilterStates = (components: IComponents) => {
  const filterComponents: IComponent[] = lodash(components)
    .pickBy(c =>
      Object.values(components).some(other => other?.props?.textFilter == c.id)
      ||
      Object.values(components).some(other => other?.props?.filterValue == c.id)
    )
    .values()

  return filterComponents
    .map(c => {
      const stateName: any = c.id.replace(/^comp-/, '')
      return `const [${stateName}, set${stateName}]=useState(null)\n
      useEffect(()=> {
        setPagesIndex({}, () => reload())
      }, [${stateName}])`
    })
    .join('\n')
}

const getValidDataProviders = (components:IComponents): IComponent[] => {
  const result = lodash(components)
    .pickBy(c => (c.type=='DataProvider' || c.id=='root') && c.props?.model)
    .values()
  return result
}

const buildHooks = (components: IComponents) => {
  // Returns attributes names used in this dataProvider for 'dataProvider'
  const getDataProviderFields = (dataProvider: IComponent) => {
    const fields = getFieldsForDataProvider(dataProvider.id, components)
    return fields
  }

  const getLimits = (dataProvider: IComponent) => {
    const fields = getLimitsForDataProvider(dataProvider.id, components, getDynamicType)
    return fields.map(([name, limit]) => `limit${name ? '.'+name : ''}=${limit}`)
    return fields
  }

  const getFiltersObject = (dataProvider: IComponent) => {
    const constantFilters = Object.values(components)
      .filter(c => c.props.filterAttribute && c.props.filterConstant && c.props.dataSource==dataProvider.id)
      .map(c => {
        const fieldName=computeDataFieldName(c, components, dataProvider.id)
        const filterAttribute=c.props.filterAttribute
        const filterValue=c.props.filterConstant
        return [`${fieldName ? fieldName+'.' : ''}${filterAttribute}`, filterValue]
      })
    const variableFilters = Object.values(components)
      .filter(c => c.props.filterAttribute2 && c.props.filterValue2 && c.props.dataSource==dataProvider.id)
      .map(c => {
        const fieldName=computeDataFieldName(c, components, dataProvider.id)
        const filterAttribute=c.props.filterAttribute2
        const filterValue=c.props.filterValue2
        return [`${fieldName ? fieldName+'.' : ''}${filterAttribute}`, filterValue]
      })
    const variableFilters2 = Object.values(components)
    .filter(c => c.props.filterAttribute && c.props.filterValue && c.props.dataSource==dataProvider.id)
    .map(c => {
      const fieldName=computeDataFieldName(c, components, dataProvider.id)
      const filterAttribute=c.props.filterAttribute
      const filterValue=c.props.filterValue
      return [`${fieldName ? fieldName+'.' : ''}${filterAttribute}`, filterValue]
    })
    const ultraVariableFilters = Object.values(components)
      .filter(c => c.props.dataSource==dataProvider.id && lodash.range(5).some(idx => !!c.props[`filterComponent_${idx}`]))
      .map(c => {
        return lodash.flatten(lodash.range(5).map(idx => {
          const filterComponent=c.props[`filterComponent_${idx}`]
          if (!filterComponent) { return []}
          const fieldName=computeDataFieldName(c, components, dataProvider.id)
          const filterAttribute=components[filterComponent].props.attribute
          const filterValue=filterComponent
          return [`${fieldName ? fieldName+'.' : ''}${filterAttribute}`, filterValue]
          }))
      })
      // TODO get Filter component 0 => 4
    const res={constants: constantFilters, variables: [...variableFilters, ...ultraVariableFilters, ...variableFilters2]}
    return res
  }


  const getSortParams = dataSourceId => {
    const dsComponents=lodash(components).values()
      .filter(c => getDynamicType(c)=='Container')
      .filter(c => c.props?.dataSource?.replace(/^comp-/, '')==dataSourceId)
      .filter(c => !!c.props?.sortAttribute && !!c.props.sortDirection)
      .map(c => {
        let fieldPath=computeDataFieldName(c, components, c.props.dataSource)
        fieldPath = fieldPath ? `${fieldPath}.${c.props?.sortAttribute}` : c.props.sortAttribute
        const fieldParam=`sort.${fieldPath}`
        const order=c.props.sortDirection
        return `${fieldParam}=${order}`
      })
    return dsComponents.join('&')
  }

  const dataProviders=getValidDataProviders(components)
  if (dataProviders.length === 0) {
    return ''
  }

  const objectsFilters=Object.fromEntries(dataProviders.map(dp => [dp.id, getFiltersObject(dp)]))
  
  const singlePage=isSingleDataPage(components)

  const isIdInDependencyArray = dataProviders.reduce((acc, curr, i) => {
    if (curr.id === 'root') {
      acc = true
    }
    return acc
  }, false)

  let code=`const FILTER_ATTRIBUTES=${JSON.stringify(objectsFilters, null, 2)}\n`
  code += `const get=axios.get`
  code +=
    '\n' +
    dataProviders
      .map(dp => {
        const dataId = dp.id.replace(/^comp-/, '')
        return `const [${dataId}, set${capitalize(dataId)}]=useState(${singlePage ? 'null':'[]'})`
      })
      .join(`\n`)
  code += `\n
  const [refresh, setRefresh]=useState(false)
  const [pagesIndex, setPagesIndex]=useState({})
    
  const computePagesIndex = dataSourceId => {
    let urlPart=Object.entries(pagesIndex)
        .filter(([att, value]) => att==dataSourceId || att.startsWith(dataSourceId+'.'))
        .map(([att, value]) => att.replace(dataSourceId, 'page')+'='+value)
        .join('&')
    if (urlPart.length>0) {
      urlPart=urlPart+'&'
    }
    return urlPart
  }


  const reload = () => {
    setRefresh(!refresh)
  }

  /** Clear components notifications  */
  const [clearComponents, setClearComponents]=useState([])
  const fireClearComponents = component_ids => setClearComponents(component_ids)

  useEffect(() => {
    if (!process.browser) { return }
    ${dataProviders
      .map(dp => {
        const dataId = dp.id.replace(/comp-/, '')
        const dpFields = getDataProviderFields(dp).join(',')
        const limits = getLimits(dp)
        const idPart = dp.id === 'root' ? `\${id ? \`\${id}/\`: \`\`}` : ''
        const sortParams = getSortParams(dataId)
        const urlRest='${new URLSearchParams(queryRest)}'
        const apiUrl = `/myAlfred/api/studio/${dp.props.model}/${idPart}${
          dpFields ? `?fields=${dpFields}&` : '?'}${limits ? `${limits.join('&')}&` : ''}${sortParams}&\${buildFilter('${dp.id}', FILTER_ATTRIBUTES, getComponentValue)}\${computePagesIndex('${dataId}')}${dp.id=='root' ? urlRest: ''}`
        let thenClause=dp.id=='root' && singlePage ?
         `.then(res => set${capitalize(dataId)}(res.data[0]))`
         :
         `.then(res => set${capitalize(dataId)}(res.data))`

        let query= `get(\`${apiUrl}\`)
        ${thenClause}
        .catch(err => !(err.response?.status==401) && err.code!='ERR_NETWORK' && alert(err?.response?.data || err))`
        if (dp.id=='root' && singlePage) {
          query=`// For single data page\nif (id) {\n${query}\n}`
        }
        return query
      })
      .join('\n')}
  }, [get, pagesIndex, ${isIdInDependencyArray ? 'id, ' : ''}refresh])\n`
  return code
}

const isFilterComponent = (component: IComponent, components: IComponents) => {

  let result=Object.values(components).some(
    c => (c.props?.textFilter == component.id || c.props?.filterValue == component.id
      || c.props?.filterValue2 == component.id
      || lodash.range(5).some(idx => c.props[`filterComponent_${idx}`]==component.id)
    )
  )

  // Check if any compoennt has this component has a filter attribute
  result = result ||Object.values(components).some(cmp => {
    return Object.entries(cmp.props).some(([propName, propvalue]) => {
      if (/^conditions/.test(propName)) {
        const value=typeof(propvalue)=='string' ? JSON.parse(propvalue):propvalue
        return Object.values(value).some((v:any) => v.attribute==component.id)
      }
    })
  })
  return result
}

const buildDynamics = (components: IComponents, extraImports: string[]) => {
  const dynamicComps = lodash.uniqBy(
    Object.values(components).filter(c => isDynamicComponent(components, c)),
    c => c.type,
  )
  if (dynamicComps.length === 0) {
    return null
  }

  const groups = lodash.groupBy(dynamicComps, c => getDynamicType(c))
  Object.keys(groups).forEach(g =>
    extraImports.push(
      `import withDynamic${g} from '../dependencies/hoc/withDynamic${g}'`,
    ),
  )

  let code = `${Object.keys(groups)
    .map(g => {
      return groups[g]
        .map(comp => `const Dynamic${comp.type}=withDynamic${g}(${getWappType(comp.type)})`)
        .join('\n')
    })
    .join('\n')}
  `
  return code
}

const buildMaskable = (components: IComponents, extraImports: string[]) => {
  const maskableComps = Object.values(components).filter(c =>
    isMaskableComponent(c),
  )

  if (maskableComps.length === 0) {
    return null
  }

  const types = lodash(maskableComps)
    .map(c => c.type)
    .uniq()

  extraImports.push(
    `import withMaskability from '../dependencies/hoc/withMaskability'`,
  )
  let code = types
    .map(type => `const Maskable${type}=withMaskability(${type})`)
    .join('\n')
  return code
}

const getWappType = type => {
  return `Wapp${type}`
}

const storeRedirectCode= (loginUrl:string) => `
useEffect(() => {
  if (user===false) {
    return
  }
  if (user===null) {
    storeAndRedirect('${loginUrl}')
  }
}, [user])
`

const reloadOnBackScript = `
useEffect(() => {
   const handlePopstate = () => {
     // This code will run when the user navigates back
     reload() // Reload the data
   };
   window.addEventListener('popstate', handlePopstate);
   return () => {
     // Cleanup: Remove the event listener when the component unmounts
     window.removeEventListener('popstate', handlePopstate);
   };
 }, []);`

export const generateCode = async (
  pageId: string,
  pages: {
    [key: string]: PageState
  },
  models: any,
  project: ProjectState
) => {
  const { components, metaTitle, metaDescription, metaImageUrl } = pages[pageId]
  const { settings } = project
  const {description, metaImage, name, url, favicon32, gaTag} = Object.fromEntries(Object.entries(settings).map(([key, value]) => [key, isJsonString(value) ? JSON.parse(value) : value]))

  const loginPage=Object.values(pages).find(page => page.components?.root?.props?.tag=='LOGIN')!
  const loginUrl=loginPage ? '/'+getPageUrl(loginPage.pageId, pages) : ''
  const extraImports: string[] = []
  const wappComponentsDeclaration = lodash(components)
    .values()
    .filter(v => v.id!='root')
    .filter(v => v.type!='DataProvider')
    .map(v => v.type)
    .uniq()
    .map(type => `const ${getWappType(type)}=withWappizy(${type})`)
  let hooksCode = buildHooks(components)
  let filterStates = buildFilterStates(components)
  let dynamics = buildDynamics(components, extraImports)
  let maskable = buildMaskable(components, extraImports)
  const singleDataPage=isSingleDataPage(components)
  const noAutoSaveComponents=getNoAutoSaveComponents(components)

  let code = buildBlock({
    component: components.root,
    components,
    pages,
    models,
    singleDataPage,
    noAutoSaveComponents
  })
  let componentsCodes = buildComponents(components, pages, singleDataPage, noAutoSaveComponents)

  const lucideIconImports = [...new Set(getIconsImports(components, 'lucid'))]
  const iconImports = [...new Set(getIconsImports(components))]




  const imports = [
    ...new Set(
      Object.keys(components)
        .filter(name => name !== 'root')
        .filter(name => components[name].type !== 'DataProvider')
        .map(name => components[name].type),
    ),
  ]

  const componentName = getPageComponentName(pageId, pages)
  // Distinguish between chakra/non-chakra components
  const module = await import('@chakra-ui/react')
  /**
  const groupedComponents = lodash.groupBy(imports, c =>
    module[c] ? '@chakra-ui/react' : `./custom-components/${c}/${c}`,
  )
  */

  // Slider exists in chakra-ui but must be imported from custom components
  const groupedComponents = lodash.groupBy(imports, c =>
    module[c] && c!='Slider' ? '@chakra-ui/react' : `../dependencies/custom-components/${c}`,
  )
  
  const componentsWithAttribute=lodash(components)
    .values()
    .filter(c => !!c.props.attribute)
    .map(c => [c.id, c.props.attribute])
    .fromPairs()
  const componentsAttributes=`const COMPONENTS_ATTRIBUTES=${JSON.stringify(componentsWithAttribute)}`
  const rootIdQuery = components.root?.props?.model
  const rootIgnoreUrlParams =
    components['root']?.props?.ignoreUrlParams == 'true'

  var usedRoles=[]
  var autoRedirect=lodash.range(REDIRECT_COUNT)
    .map(idx => {
      const [role, page]=[REDIRECT_ROLE, REDIRECT_PAGE].map(att => components?.root.props[`${att}${idx}`])
      if (role && page) {
        usedRoles.push(role)
        return   `useEffect(()=>{
            if (redirectExists()) {return}
            if (user?.role=='${role}') {window.location='/${getPageUrl(page, pages)  }'}
          }, [user])`
      }
    })
    .filter(v => !!v)
    .join('\n')

    const defaultRedirectPage=components?.root.props[DEFAULT_REDIRECT_PAGE]
  if (defaultRedirectPage) {
    const rolesArray=usedRoles.map(role => `'${role}'`).join(',')
    autoRedirect+=`\nuseEffect(()=>{
        if (redirectExists()) {return}
        if (user?.role && ![${rolesArray}].includes(user?.role)) {window.location='/${getPageUrl(defaultRedirectPage, pages)  }'}
      }, [user])`
  }
  /**
  const redirectPage=components?.root.props?.autoRedirectPage
  const autoRedirect =  redirectPage?
  :
  ''
  */

  const generateTagSend = () => {
    const tagPages=Object.values(pages)
      .filter(page => !!page.components?.root?.props?.tag)
      .map(p => [p.components.root.props.tag, `/${getPageUrl(p.pageId, pages)}`])
    return `useEffect(() => {
      const tagPages=${JSON.stringify(tagPages)}
      axios.post('/myAlfred/api/studio/tags', tagPages)
    }, [])`
  }
  let renderNullCode=''
  if(components.root.props.allowNotConnected=="false"){
    renderNullCode+= `if(!user){
      return null
    }`
  }
  const header=`/**\n* Generated from ${pageId} on ${moment().format('L LT')}\n*/`
  code = `${header}\nimport React, {useState, useEffect} from 'react';
  import Filter from '../dependencies/custom-components/Filter/Filter';
  import {buildFilter} from '../dependencies/utils/filters'
  import omit from 'lodash/omit';
  import lodash from 'lodash';
  import Metadata from '../dependencies/Metadata';
  ${hooksCode ? `import axios from 'axios'` : ''}
  ${Object.entries(groupedComponents)
    .map(([modName, components]) => {
      const multiple = modName.includes('chakra-ui')
      return `import ${multiple ? '{' : ''}
      ${components.join(',')}
    ${multiple ? '}' : ''} from "${modName}";
    `
    })
    .join('\n')}
${
  iconImports.length
    ? `
import { ${iconImports.join(',')} } from "@chakra-ui/icons";`
    : ''
}
${
  lucideIconImports.length
    ? `
import { ${lucideIconImports.join(',')} } from "lucide-react";`
    : ''
}

import {ensureToken, storeAndRedirect} from '../dependencies/utils/token'
import {useRouter} from 'next/router'
import { useUserContext } from '../dependencies/context/user'
import { getComponentDataValue } from '../dependencies/utils/values'
import withWappizy from '../dependencies/hoc/withWappizy'
import { redirectExists } from '../dependencies/utils/misc'

${extraImports.join('\n')}
${wappComponentsDeclaration.join('\n')}

${dynamics || ''}
${maskable || ''}
${componentsCodes}


const ${componentName} = () => {

  const {user}=useUserContext()
  ${autoRedirect}
  ${components.root.props.allowNotConnected=="true" ? '' : storeRedirectCode(loginUrl)}
  /** Force reload on history.back */
  ${reloadOnBackScript}
  const query = process.browser ? Object.fromEntries(new URL(window.location).searchParams) : {}
  const id=${rootIgnoreUrlParams ? 'null' : 'query.id'}
  const queryRest=omit(query, ['id'])
  const [componentsValues, setComponentsValues]=useState({})

  ${componentsAttributes}
  const setComponentValue = (compId, value) => {
    if (lodash.isEqual(value, componentsValues[compId])) {
      return
    }
    setComponentsValues(s=> ({...s, [compId]: value}))
  }

  const getComponentValue = (compId, index) => {
    let value=componentsValues[compId]
    if (!value) {
      value=componentsValues[\`\$\{compId\}\$\{index\}\`]
    }
    if (!value) {
      value=getComponentDataValue(compId, index)
    }
    return value
  }

  const getComponentAttribute = (compId, level) => {
    return COMPONENTS_ATTRIBUTES[compId.split('_')[0]]
  }

  // ensure token set if lost during domain change
  useEffect(() => {
    ensureToken()
  }, [])

  
  ${hooksCode}
  ${filterStates}
  ${components.root.props.allowNotConnected=="true" ? '' : storeRedirectCode(loginUrl)}
  ${generateTagSend()}
  
  ${renderNullCode}
  return ${autoRedirect ? 'user===null && ': ''} (
    <>
    <Metadata
      metaTitle={'${metaTitle && addBackslashes(metaTitle)}'}
      metaDescription={'${metaDescription ? addBackslashes(metaDescription) : addBackslashes(description)}'}
      metaImageUrl={'${metaImageUrl ? addBackslashes(metaImageUrl) : addBackslashes(metaImage)}'}
      metaName={'${name && addBackslashes(name)}'}
      metaUrl={'${url}'}
      metaFavicon32={'${favicon32 && addBackslashes(favicon32)}'}
      metaGaTag={'${gaTag}'}
    />
    ${code}
    </>
)};

export default ${componentName};`

    return await formatCode(code)
}

export const generateApp = async (state: ProjectState) => {
  /**
  <ul>
${pageNames.map(name => `<li><a href='/${name}'>${name}</a></li>`).join('\n')}
</ul>
*/
  const { pages, rootPage } = state
  let code = `import {BrowserRouter, Routes, Route} from 'react-router-dom'
  import { UserWrapper } from './dependencies/context/user'
  import theme from './dependencies/theme/theme'
  import Fonts from './dependencies/theme/Fonts'
  import {ChakraProvider} from "@chakra-ui/react"
  ${Object.values(pages)
    .map(
      page =>
        `import ${getPageComponentName(
          page.pageId,
          pages,
        )} from './${getPageFileName(page.pageId, pages)}'`,
    )
    .join('\n')}

  const App = () => (
    <UserWrapper>
    <ChakraProvider resetCSS theme={theme}>
      <Fonts />
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<${getPageComponentName(rootPage, pages)}/>} />
      ${Object.values(pages)
        .map(
          page =>
            `<Route path='/${getPageUrl(
              page.pageId,
              pages,
            )}' element={<${getPageComponentName(page.pageId, pages)}/>} />`,
        )
        .join('\n')}
    </Routes>
    </BrowserRouter>
    </ChakraProvider>
    </UserWrapper>
  )

  export default App
  `
  code = await formatCode(code)
  return code
}
