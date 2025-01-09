import lodash from 'lodash'

import { ProjectState } from '~/core/models/project'

import { getPageUrl } from './misc';
import { getParentOfType, hasParentType } from './dataSources';
import projectSchema from './projectSchema.json'

const Validator = require('jsonschema').Validator
import { CONTAINER_TYPE } from './dataSources'
import {ACTIONS} from './actions'

const checkEmptyDataAttribute = (
  comp: IComponent,
  icomponents: IComponents,
) => {
  if (
    !CONTAINER_TYPE.includes(comp.type) &&
    comp.props.dataSource &&
    !comp.props.attribute &&
    comp.type != 'Button' &&
    comp.type != 'IconButton' &&
    (comp.type!='Radio' || !hasParentType(comp, icomponents, 'RadioGroup')) &&
    (comp.type!='Checkbox' || !hasParentType(comp, icomponents, 'RadioGroup')) &&
    (comp.type!='IconCheck' || !hasParentType(comp, icomponents, 'RadioGroup')) &&
    (comp.type!='Radio' || !hasParentType(comp, icomponents, 'CheckboxGroup')) &&
    (comp.type!='Checkbox' || !hasParentType(comp, icomponents, 'CheckboxGroup')) &&
    (comp.type!='IconCheck' || !hasParentType(comp, icomponents, 'CheckboxGroup'))
  ) {
    throw new Error(`Datasource attribute is not set`)
  }
}

const checkActionsProperties = (
  comp: IComponent,
  icomponents: IComponents,
) => {
  const actionAtts=['action', 'nextAction']
  actionAtts.forEach(actionAtt => {
    if (comp.props[actionAtt]) {
      const actionName=comp.props[actionAtt]
      const required=ACTIONS[actionName].required || []
      let actionProps=comp.props[`${actionAtt}Props`]
      try {
        actionProps=JSON.parse(actionProps)
      }
      catch(err){}
      const missing=required.filter(r => lodash.isEmpty(actionProps[r]))
      if (!lodash.isEmpty(missing)) {
        throw new Error(`Action ${actionName} requires attributes ${missing}`)
      }
    }
  })
}

const checkEmptyDataProvider = (comp: IComponent, icomponents: IComponents) => {
  if (comp.type === 'DataProvider') {
    if (!comp.props?.model) {
      throw new Error(`DataProvider has no model`)
    }
  }
}

const checkUnusedDataProvider = (comp: IComponent, icomponents: IComponents) => {
  if (comp.type === 'DataProvider' || (comp.id == 'root' && !!comp.props.model)) {
    if (!Object.values(icomponents).find(c => c.props?.dataSource==comp.id || c.props?.subDataSource==comp.id)) {
      throw new Error(`DataProvider ${comp.id} is not used`)
    }
  }
}

const checkDispatcherManyChildren = (
  comp: IComponent,
  icomponents: IComponents,
) => {
  const parent = icomponents[comp.parent]
  if (
    CONTAINER_TYPE.includes(parent.type) &&
    parent.props.dataSource &&
    parent.children.slice(2).includes(comp.id)
  ) {
    throw new Error(
      `Extra child ${comp.type} of dynamic ${parent.type} will not appear at runtime`,
    )
  }
}

const checkEmptyIcons = (comp: IComponent, icomponents: IComponents) => {
  const ICON_PROPS = ['leftIcon', 'rightIcon', 'icon']
  ICON_PROPS.forEach(i => {
    if (comp?.props?.[i] === 'Icon') {
      throw new Error(`Icon ${comp.id} is not defined`)
    }
  })
}

const checkAvailableDataProvider = (
  comp: IComponent,
  icomponents: IComponents,
) => {
  if (!comp.props?.dataSource) {
    return
  }
  if (!Object.keys(icomponents).includes(comp.props.dataSource)) {
    throw new Error(`DataProvider ${comp.props.dataSource} not found`)
  }
}

const checkUnlinkedDataProvider = (
  comp: IComponent,
  icomponents: IComponents,
) => {
  if (!comp.props?.dataSource) {
    return
  }
  const dp = icomponents[comp.props.dataSource]
  if (!dp.props.model) {
    throw new Error(`DataSource '${comp.props.dataSource}' has no model`)
  }
}

const checkCardinality = (
  comp: IComponent,
  icomponents: IComponents,
) => {
  if (comp.id!='root') {
    return
  }
  if (!!comp.props.model!==!!comp.props.cardinality) {
    throw new Error(`Model requires cardinality`)
  }
}

// In dynamic Tabs (i.e. having dataSource), maskability must be
// managed in the Tab instead of the TabPanel
const checkTabPanelMaskability = (
  comp: IComponent,
  icomponents: IComponents,
) => {
  if (comp.type=='TabPanel' && (comp.props.hiddenRoles || comp.props.conditionsvisibility)) {
    if (getParentOfType(icomponents, comp, 'Tabs')?.props.dataSource) {
      throw new Error(`Dynamic TabPanel's maskability must be managed by the corresponding Tab`)
    }
  }
}

export const validateComponent = (
  component: IComponent,
  components: IComponents,
): IWarning[] => {
  const warnings = lodash([
    checkEmptyDataProvider,
    checkAvailableDataProvider,
    checkUnusedDataProvider,
    checkEmptyIcons,
    checkDispatcherManyChildren,
    checkEmptyDataAttribute,
    checkUnlinkedDataProvider,
    checkCardinality,
    checkActionsProperties,
    checkTabPanelMaskability,
  ])
    .map(v => {
      try {
        v(component, components)
        return null
      } catch (err:any) {
        return { component, message: err.message }
      }
    })
    .flatten()
    .filter(w => !!w)
    .value()
  return warnings
}

export const validateComponents = (icomponents: IComponents): IWarning[] => {
  const components = Object.values(icomponents)
  const warnings = lodash([
    checkEmptyDataProvider,
    checkAvailableDataProvider,
    checkUnusedDataProvider,
    checkEmptyIcons,
    checkDispatcherManyChildren,
    checkEmptyDataAttribute,
    checkUnlinkedDataProvider,
    checkCardinality,
    checkActionsProperties,
    checkTabPanelMaskability,
  ])
    .map(v => {
      return components.map(c => {
        try {
          v(c, icomponents)
          return null
        } catch (err:any) {
          return { component: c, message: err.message }
        }
      })
    })
    .flatten()
    .filter(c => !!c)
    .value()
  return warnings
}

export const validateProject = (project: ProjectState): IWarning[] => {
  const pages=Object.values(project.pages)
  const warningPages=lodash(pages)
    .groupBy(page => getPageUrl(page.pageId, project.pages))
    .mapValues(v => v.map(p => p.pageName))
    .pickBy(v => v.length>1)
    .values()
  const loginPages=Object.values(pages).filter(page => page.components?.root?.props?.tag=='LOGIN')
  // Exactly one login page is required
  if (lodash.isEmpty(loginPages)) {
    return [`Could not found page with LOGIN tag`]
  }
  // Exactly one login page is required
  if (loginPages.length>1) {
    return [`${loginPages.length} pages ${loginPages.map(p => p.pageName)} have LOGIN tag, only one is allowed`]
  }
  const loginPage=loginPages[0]
  // Login page must allow not connected
  if (loginPage?.components.root?.props?.allowNotConnected!='true') {
    return [`Login page '${loginPage.pageName}' must allow not connected`]
  }
  const indexPage=project.pages[project.rootPage]
  // Login page must allow not connected
  if (indexPage?.components.root?.props?.allowNotConnected!='true') {
    return [`Index page '${indexPage.pageName}' must allow not connected`]
  }


  const warningsComponents = lodash(pages)
    .map(p => [p.pageName, validateComponents(p.components)])
    .fromPairs()
    .pickBy(v => v.length>0)
    .mapValues(v => v.map(err => `${err.component.id}:${err.message}`).join(','))
    .value()
  return lodash.isEmpty(warningsComponents) ? null : warningsComponents
}

export const validateJSON = (jsonObject: object) => {
  const validator = new Validator()
  const validationResult = validator.validate(jsonObject, projectSchema)
  if (!validationResult.valid) {
    throw new Error(validationResult.errors)
  }
}
