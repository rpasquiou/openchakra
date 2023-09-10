//import { DataSourcesState } from '~/core/models/dataSources'
import lodash from 'lodash'
import {generateId} from './generateId'

export const generateProject = (pages:any) => {
  return ({
    rootPage: pages[0].pageId,
    activePage: pages[0].pageId,
    version: 2,
    pages: Object.fromEntries(pages.map((p:any) => ([p.pageId, p])))
  })
}

export const generatePage = (model:string, level:number, models:any) => {
  const mdl=models.find((m:any) => m.name==model)
  const root:IComponent={
    id:'root',
    parent: 'root',
    type:'Box',
    children:[],
    props:{model, cardinality: "multiple"}
  }
  const children=generateModel('root', mdl, models, level)
  const components:object=Object.fromEntries(lodash.flatten([root, ...children]).map(c => [c.id, c]))
  // Set children
  Object.values(components).forEach(comp => {
    comp.children=Object.values(components).filter(child => child.parent==comp.id && child.id!='root').map(child => child.id)
  })
  const pageId=generateId('page')
  const pageName=`Model ${model}`
  const selectedId='root'
  return {pageName, pageId, components, selectedId, metaTitle: "", metaDescription: "", metaImageUrl: "",}
}

const generateAttribute = (parentId:string, name:any, attr: any, models:any, level: number):any => {
  const cmp:any={
    String: 'Input',
    Boolean: 'CheckBox',
    Number: 'NumberInput',
    Date: 'Date',
  }
  let child:IComponent={
    id: generateId(),
    parent: parentId,
    type: cmp[attr.type],
    rootParentType: cmp[attr.type],
    props: {dataSource: 'root', attribute: name},
    children:[],
  }
  let others:IComponent[]=[]
  if (attr.ref && attr.multiple) {
    const subFlex:IComponent={
      id: generateId(),
      parent: child.id,
      type: attr.ref ? 'Flex' : cmp[attr.type],
      rootParentType: attr.ref ? 'Flex' : cmp[attr.type],
      props:{},
      children:[],
    }
    const allChildren=generateModel(subFlex.id, attr.type, models, level-1)
    others=[subFlex, ...allChildren]
  }
  if (attr.ref && !attr.multiple) {
    const subModelAttributes=models.find((m:any) => m.name==attr.type).attributes
    const allChildren= Object.entries(subModelAttributes).map(([subName, attr]:[string, any]) => generateAttribute(parentId, `${name}.${subName}`, attr, models, level))
    others=[...allChildren]
  }
  return [child, ...others]
}

const generateModel = (parentId:string, model:any, models:any, level:number):IComponent[] => {
  const flex:IComponent={
    id: generateId(),
    parent: parentId,
    type: 'Flex',
    rootParentType: 'Flex',
    children:[],
    props:{dataSource: 'root'}
  }
  const subFlex:IComponent={
    id: generateId(),
    parent: flex.id,
    type: 'Flex',
    rootParentType: 'Flex',
    children:[],
    props:{}
  }
  const attributes=lodash(model.attributes).pickBy(v => !v.multiple).value()
  const children=Object.entries(attributes).map(([name, attr]:[string, any]) => generateAttribute(subFlex.id, name, attr, models, level))
  return [flex, subFlex, ...children]
}
