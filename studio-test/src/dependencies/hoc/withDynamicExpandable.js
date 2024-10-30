import React, {useState, useEffect} from 'react'

const withDynamicExpandable = Component => {

  const internal = ({children, ...props}) => {

    props.key=props.id
    const firstChild = React.Children.toArray(children)[0]

    // PERF: Don't display all children if collapsed and has datasource
    const displayAllChildren = (expanded) => {
      return expanded || !props.dataSource
    }
    return (
      <Component {...props}>
        {({isExpanded}) => (
          <>
          {displayAllChildren(isExpanded) ? children : firstChild}
          </>
        )}
      </Component>
    )
  }

  return internal
}

export default withDynamicExpandable
