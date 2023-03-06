import lodash from 'lodash'

const getLinkedPages = (pageId: String, project:ProjectState) => {
  const page=project.pages[pageId]
  const comps=lodash(page.components).values()
    .filter(c => [c.props?.action, c.props?.nextAction].includes('openPage'))
    .map(c => [c.props.actionProps, c.props.nextActionProps].map(p => {
      const res=p ? (typeof(p)=='object' ? p: JSON.parse(p)).page : null
      return res
    }))
    .flatten()
    .filter(v => !!v)
    .value()
  console.log(`${page.pageName}=>${comps.map(p => project.pages[p].pageName)}`)
  return comps
}

export const generateSitemap = (project: ProjectState) => {
  const allPages=project.pages
  const rootPage=project.rootPage
  console.log(rootPage)
  const nodes=[]
  const edges=[]
  const toExplore=[rootPage]
  const explored=[]
  while (toExplore.length>0) {
    const pageId=toExplore.pop()
    if (!explored.includes(pageId)) {
      nodes.push({id: pageId, label: allPages[pageId].pageName })
      explored.push(pageId)
      const pages=getLinkedPages(pageId, project)
      toExplore.push(...pages)
      pages.forEach(p => edges.push({from: pageId, to: p}))
    }
  }
  console.log(`ok ici`)
  return {nodes, edges}
}
