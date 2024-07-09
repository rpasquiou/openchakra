import React from 'react'
import lodash from 'lodash'

const withDynamicSlider = Component => {

  const internal = (props) => {
    let src = lodash.get(props.dataSource, props.attribute)

    const chakraStyles = {
      container: (provided, state) => ({
        ...provided,
        bg: "transparent",
      })
      
    }
    if (!src) {
      src = props.src
    }
    return (
      <Component {...lodash.omit(props, ['children'])} src={src} value={src} chakraStyles={chakraStyles}/>
    )
  }

  return internal
}

export default withDynamicSlider
