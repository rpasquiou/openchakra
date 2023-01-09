import lodash from 'lodash'
import { CONTAINER_TYPE } from './dataSources'
import {getAvailableAttributes} from './datasources'
const projectSchema = require('./projectSchema.json')
var Validator = require('jsonschema').Validator

const checkEmptyDataAttribute = ({component}) => {
  if (
    !CONTAINER_TYPE.includes(component.type) &&
    component.type != 'Button' &&
    component.type != 'IconButton' &&
    component.props.dataSource &&
    !component.props.attribute
  ) {
    throw new Error(`Datasource attribute is not set`)
  }
}

const checkUndefinedPage = ({component, pageNames}) => {
  if (component.props.action=='openPage') {
    let actionProps=component.props.actionProps
    if (lodash.isString(actionProps)) {actionProps=JSON.parse(actionProps)}
    if (!pageNames.includes(actionProps.page)) {
      throw new Error(`Open unknown:${actionProps.page}`)
    }
  }
  if (component.props.nextAction=='openPage') {
    let actionProps=component.props.nextActionProps
    if (lodash.isString(actionProps)) {actionProps=JSON.parse(actionProps)}
    if (!pageNames.includes(actionProps.page)) {
      throw new Error(`Next: open unknown:${actionProps.page})}`)
    }
  }
}

const checkIncorrectAttributes = ({component, components, models}) => {
  if (component.props.dataSource && component.props.attribute) {
    const availableAttributes=Object.keys(getAvailableAttributes(component, components, models))
    if (!availableAttributes.includes(component.props.attribute)) {
      throw new Error(`Attribute ${component.props.attribute} not available, check the parent's datasources`)
    }
  }
}

const checkEmptyDataProvider = ({component, components}) => {
  if (component.type === 'DataProvider') {
    if (!component.props?.model) {
      throw new Error(`DataProvider has no model`)
    }
  }
}

const checkDispatcherManyChildren = ({component, components}) => {
  const parent = components[component.parent]
  if (
    CONTAINER_TYPE.includes(parent.type) &&
    parent.props.dataSource &&
    parent.children.slice(1).includes(component.id)
  ) {
    throw new Error(
      `Extra child ${component.type} of dynamic ${parent.type} will not appear at runtime`,
    )
  }
}

const checkEmptyIcons = ({component}) => {
  const ICON_PROPS = ['leftIcon', 'rightIcon', 'icon']
  ICON_PROPS.forEach(i => {
    if (component.props?.[i] === 'Icon') {
      throw new Error(`Icon ${component.id} is not defined`)
    }
  })
}

const checkAvailableDataProvider = ({component, components}) => {
  if (!component.props.dataSource) {
    return
  }
  if (!Object.keys(components).includes(component.props.dataSource)) {
    throw new Error(`DataProvider ${component.props.dataSource} not found`)
  }
}

const checkUnlinkedDataProvider = ({component, components}) => {
  if (!component.props.dataSource) {
    return
  }
  const dp = components[component.props.dataSource]
  if (!dp.props.model) {
    throw new Error(`DataSource '${component.props.dataSource}' has no model`)
  }
}

const checkCardinality = ({component, components}) => {
  if (component.id!='root') {
    return
  }
  if (!!component.props.model!==!!component.props.cardinality) {
    throw new Error(`Model requires cardinality`)
  }
}

export const validateComponent = (component: IComponent, components: IComponents, models: any, pageNames: string[]): IWarning[] => {
  const warnings = lodash([
    checkEmptyDataAttribute,
    checkUndefinedPage,
    checkEmptyDataProvider,
    checkIncorrectAttributes,
    checkAvailableDataProvider,
    checkEmptyIcons,
    checkDispatcherManyChildren,
    checkUnlinkedDataProvider,
    checkCardinality,
  ])
    .map(v => {
      try {
        v({component, components, models, pageNames})
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

export const validate = (icomponents: IComponents, models: any, pageNames): IWarning[] => {
  const components = Object.values(icomponents)
  const warnings = lodash([
    checkEmptyDataAttribute,
    checkUndefinedPage,
    checkEmptyDataProvider,
    checkIncorrectAttributes,
    checkAvailableDataProvider,
    checkEmptyIcons,
    checkDispatcherManyChildren,
    checkUnlinkedDataProvider,
    checkCardinality,
  ])
    .map(v => {
      return components.map(component => {
        try {
          v({component, components: icomponents, models, pageNames})
          return null
        } catch (err:any) {
          return { component, message: err.message }
        }
      })
    })
    .flatten()
    .filter(c => !!c)
    .value()
  return warnings
}

export const validateJSON = (jsonObject: object) => {
  const validator = new Validator()
  const validationResult = validator.validate(jsonObject, projectSchema)
  if (!validationResult.valid) {
    throw new Error(validationResult.errors)
  }
}
