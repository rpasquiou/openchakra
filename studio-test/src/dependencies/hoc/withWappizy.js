import React, {useState, useEffect} from 'react'
import lodash from 'lodash'
import { getConditionalProperties } from '../utils/filters'
import moment from 'moment'

const withWappizy = Component => {

  const internal = ({children, ...props}) => {

    const BUTTONS=['Button', 'IconButton']

    const compType=Component.displayName

    if (compType=='Tabs' && props.isWizard) {
      props.index=props.getComponentValue(props.id, props.level?.toString()) || 0
    }
    
    if (BUTTONS.includes(compType) && props.tag=='PREVIOUS') {
      props.onClick=() => props.setComponentValue(props.parentTab, Math.max(props.getComponentValue(props.parentTab)-1, 0))
      if (!+props.getComponentValue(props.parentTab)) {
        props.display='none'
      }
    }

    if (BUTTONS.includes(compType) && props.tag=='NEXT') {
      props.onClick=() => {
        props.setComponentValue(props.parentTab, Math.max(+props.getComponentValue(props.parentTab)+1, 0))
      }
      if (+props.getComponentValue(props.parentTab)>=+props.parentTabPanelsCount-1) {
        props.display='none'
      }
    }

    if (BUTTONS.includes(compType) && props.tag=='FINISH') {
      if (+props.getComponentValue(props.parentTab)!=(+props.parentTabPanelsCount)-1) {
        props.display='none'
      }
    }

    const conditionalProperties = getConditionalProperties(props,props.dataSource)

    const [defaultIndex, setDefaultIndex]=useState(undefined)
    const [key, setKey]=useState(props.key)

    if (props.scrollToday) {
      useEffect(() => {
        if (!!props.dataSource) {
          const data=lodash.get(props.dataSource, props.attribute)
          const index=data.findIndex(obj => moment(obj.day).isSame(moment(), 'day'))
          setDefaultIndex(index)
        }
      }, [props.dataSource])
      useEffect(()=> {
        setKey(moment())
      }, [defaultIndex])
      useEffect(()=> {
        setTimeout(() => {
          const childs=React.Children.toArray(children)
          const tabList=document.getElementById(childs[0].props.id)
          console.log('tabList', tabList, tabList.scrollWidth)
          tabList.scrollLeft=tabList.scrollWidth
          }, 300);
      }, [children])
    }

    const all_props={...props, ...conditionalProperties, defaultIndex, key}

    return (
      <Component {...all_props}>
       {children}
      </Component>
    )
  }

  return internal
}

export default withWappizy
