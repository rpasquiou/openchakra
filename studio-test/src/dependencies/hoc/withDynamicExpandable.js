import React, {useState, useEffect} from 'react'

const withDynamicAccordionItem = Component => {

  const internal = ({children, ...props}) => {

    props.key=props.id
    const firstChild = React.Children.toArray(children)[0]

    return (
      <Component {...props}>
        {({isExpanded}) => (
          <>
          {isExpanded ? children : firstChild}
          </>
        )}
      </Component>
    )
  }

  return internal
}

export default withDynamicAccordionItem
