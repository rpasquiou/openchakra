import {useState, useEffect} from 'react'
import axios from 'axios'
import { useParams } from 'app/utils/useParams'
import { ACTIONS, API_ROOT } from 'app/components/dependencies/utils/actions'
import {
  extractFiltersFromProps,
  getConditionalProperties,
} from 'app/components/dependencies/utils/filters'

const withDynamicButton = Component => {
  const Internal = props => {
    const query = useParams()
    const {
      dataSource: value,
      action,
      nextAction,
      context,
      dataModel,
      backend,
      refs,
      reload,
    } = props

    const actionProps = props.actionProps ? JSON.parse(props.actionProps) : {}
    const nextActionProps = props.nextActionProps
      ? JSON.parse(props.nextActionProps)
      : {}
    
    let onClick = props.onClick

    const [actionAllowed, setActionAllowed]=useState(true)

    useEffect(()=> {
      axios.get(`${API_ROOT}/action-allowed/${action}/${value?._id}`)
        .then(res => setActionAllowed(res.data))
        .catch(err => console.error(err))
    }, [action, value])

    if (action) {
      onClick = () => {
        if (!ACTIONS[action]) {
          return alert(`Undefined action ${action}`)
        }
        return ACTIONS[action]({
          ...props,
          value: value,
          props: actionProps,
          backend,
          context,
          dataModel,
          query,
          refs,
          model: props.dataModel,
        })
          .then(res => {
            if (!nextAction) {
              return true
            }
            const params = {
              ...props,
              value: res,
              props: nextActionProps,
              backend,
              context,
              dataModel,
              query,
              refs,
              model: props.dataModel,
              ...res,
            }
            return ACTIONS[nextAction](params)
          })
          .then(() => {
            console.log('ok')
            typeof reload === 'function' && reload()
          })
          .catch(err => {
            // console.error(err)
            // alert(err.response?.data || err)
          })
      }
    }
    const conditionalProperties = getConditionalProperties(
      props,
      props.dataSource,
    )
    return (
      <Component disabled={!actionAllowed}
        {...props}
        onClick={onClick}
        {...conditionalProperties}
      ></Component>
    )
  }

  return Internal
}

export default withDynamicButton
