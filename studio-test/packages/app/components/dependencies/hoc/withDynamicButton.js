import { useParams } from 'app/utils/useParams'
import { ACTIONS } from 'app/components/dependencies/utils/actions'
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
      reload,
    } = props

    const actionProps = props.actionProps ? JSON.parse(props.actionProps) : {}
    const nextActionProps = props.nextActionProps
      ? JSON.parse(props.nextActionProps)
      : {}
    
    let onClick = props.onClick
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
            console.error(err)
            alert(err)
          })
      }
    }
    const conditionalProperties = getConditionalProperties(
      props,
      props.dataSource,
    )
    return (
      <Component
        {...props}
        onClick={onClick}
        {...conditionalProperties}
      ></Component>
    )
  }

  return Internal
}

export default withDynamicButton
