import lodash, { filter } from 'lodash'
import {generateId} from './generateId'
import {CURRENT_VERSION} from './upgrade'

const DEBUG=false

const log:any=DEBUG ? console.log : () => {}

const components:IComponents={}

const addComponent = (comp: IComponent) => {
  const {id, parent}=comp
  if (!!components[id]) {
    throw new Error(`Component id ${id} already exists`)
  }
  components[id]=comp
  // Link to parent if not rooot
  if (id!='root') {
    const parentComponent=components[parent]
    if (!parentComponent) {
      throw new Error(`Parent id ${parent} not found`)
    }
    parentComponent.children.push(id)
  }
}

export const generateProject = (pages:any) => {
  return ({
    rootPage: pages[0].pageId,
    activePage: pages[0].pageId,
    version: 2,
    pages: Object.fromEntries(pages.map((p:any) => ([p.pageId, p])))
  })
}

let maxLevel=0

export const generatePage = (modelName:string, level:number, models:any) => {
  maxLevel=level
  const mdl=models[modelName]
  const root:IComponent={
    id:'root',
    parent: 'root',
    type:'Box',
    children:[],
    props:{model: modelName, cardinality: "multiple"}
  }
  addComponent(root)
  const children=generateModel({parentId: 'root', modelName, models, level, multiple:true})
  return {pageId: generateId('page'), components: components, selectedId: 'root', pageName:`Model ${modelName}`}
}

const generateAttributeContainer = (parentId: string, name: string, prefix:string|null, type: string) => {
  const container:IComponent={
    id: generateId(),
    type: 'Flex',
    props: {flexDirection: 'row'},
    parent: parentId,
    children: [],
  }
  addComponent(container)
  const label:IComponent={
    id: generateId(),
    type: 'Text',
    props: {children: name, flex:1},
    parent: container.id,
    children: [],
  }
  addComponent(label)
  const attributeName=prefix ? `${prefix}.${name}`: name
  type ComponentTypes = {
    [key: string]: ComponentType;
  }
  const COMPONENT_TYPES:ComponentTypes={
    Boolean: 'Switch',
    Date: 'Date',
    Number: 'NumberFormat',
  }
  log('generating field for', attributeName)
  const input:IComponent={
    id: generateId(),
    type: COMPONENT_TYPES[type] || 'Text',
    props: {attribute: attributeName, dataSource: 'root', flex:3, "data-format":{year: 'numeric',month: 'numeric',day: 'numeric',hour: 'numeric',minute: 'numeric'}},
    parent: container.id,
    children: [],
  }
  addComponent(input)

}
const generateAttribute = (parentId: string, name:string, params:any, models: any, level:number, prefix?:string ):IComponent|null => {
  if (!params.ref || level>0) {
    // log('generating attribute', name, params.type)
  }
  if (params.ref) {
    // TODOManage non-multiple ref
    // if (params.multiple) {
      const pref=params.multiple ? name :  prefix ? `${prefix}.${name}`  : name
      generateModel({parentId, modelName: params.type, models, level:level-1, multiple:params.multiple, prefix: pref})
    // }
  }
  else {
    generateAttributeContainer(parentId, name, prefix||null, params.type)
  }
  return null
}

const generateAccordion = (parentId:string, attribute:string) => {
  const accordion:IComponent={id: generateId(), type: 'Accordion', parent: parentId, children: [], props:{allowToggle: true}}
  addComponent(accordion)
  const accordionItem:IComponent={id: generateId(), type: 'AccordionItem', parent: accordion.id, children: [], props:{}}
  addComponent(accordionItem)

  const accordionButton:IComponent={id: generateId(), type: 'AccordionButton', parent: accordionItem.id, children: [], props:{}}
  addComponent(accordionButton)
  const accordionText:IComponent={id: generateId(), type: 'Text', parent: accordionButton.id, children: [], props:{children: attribute}}
  addComponent(accordionText)
  const accordionIcon:IComponent={id: generateId(), type: 'AccordionIcon', parent: accordionButton.id, children: [], props:{children: attribute}}
  addComponent(accordionIcon)

  const accordionPanel:IComponent={id: generateId(), type: 'AccordionPanel', parent: accordionItem.id, children: [], props:{}}
  addComponent(accordionPanel)
  return accordionPanel
}
const generateModel = ({parentId, modelName, models, level, multiple, prefix}:
  {parentId: string, modelName:string, models:any, level:number, multiple:boolean, prefix?:string}):IComponent[] => {
  if (level>=0) {
    log('generate model', modelName, multiple ? 'multiple' : '', 'prefix', prefix)
    let multipleContainer:IComponent|null=null
    if (multiple) {
      const accordion=prefix ? generateAccordion(parentId, prefix!) : null
      multipleContainer={
        id:generateId(),
        type: 'Flex',
        parent: accordion?.id || parentId,
        children: [],
        props: {flexDirection: "column", dataSource: 'root', attribute: prefix}
      }
     addComponent(multipleContainer)
    }
    const container:IComponent={
      id:generateId(),
      type: 'Flex',
      parent: multipleContainer?.id || parentId,
      children: [],
      // props: {flexDirection: "column", border: '1px solid black', ml: `${1*(maxLevel-level)}%`}
      props: {flexDirection: "column", ml: `${1*(maxLevel-level)}%`}
    }
    addComponent(container)
    const label:IComponent={
      id:generateId(),
      type: 'Text',
      parent: container.id,
      children: [],
      props: {children: prefix ? prefix :  `Modèle ${modelName}`}
    }
    addComponent(label)
    console.group()
    const attributes=lodash.pickBy(models[modelName].attributes, (v, k) => !/\./.test(k))
    Object.entries(attributes).map(([name, attDef]) => generateAttribute(container.id, name, attDef, models, level, multiple ? '' : prefix))
    console.groupEnd()
  }
  return []
}
