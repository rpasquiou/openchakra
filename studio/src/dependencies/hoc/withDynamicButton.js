import React, {useState, useEffect} from 'react'
import axios from 'axios';
import lodash from 'lodash'
import { useRouter } from 'next/router'
import { ACTIONS } from '../utils/actions'
import { MESSAGES } from '../utils/messages'
import {
  getConditionalProperties,
} from '../utils/filters'
import {displayError, displaySuccess} from '../utils/notifications'
import { useToast } from '@chakra-ui/react';
import { useVisible } from 'react-hooks-visible';

const withDynamicButton = Component => {

  const Internal = props => {

    const [insideAction, setInsideAction]=useState(false)


    const router = useRouter()
    const toast=useToast()

    const [targetRef, visible] = useVisible()

    const query = new URLSearchParams(router?.asPath)
    let value = props.dataSource
    if (props.attribute) {
      value=lodash.get(value, props.attribute)
    }
    const action = props.action
    const nextAction = props.nextAction
    const context = props.context
    const dataModel = props.dataModel
    const actionProps = props.actionProps ? JSON.parse(props.actionProps) : {}
    const nextActionProps = props.nextActionProps
      ? JSON.parse(props.nextActionProps)
      : {}
    // Remove default value for Calendar
    // let onClick = props.onClick ? lodash.debounce(props.onClick, 2000) : null
    let onClick=() => {}

    const [actionAllowed, setActionAllowed]=useState(false)

    useEffect(() => {
      if (!!props.poll) {
        const intervalId = setInterval(() => {
          checkStatus()
        }, 1000)
    
        return () => {
          clearInterval(intervalId);
          console.log('Interval cleared');
        }
      }
    }, []);
    const checkStatus = () => {
      if (['openPage'].includes(action)) {
        return setActionAllowed(true)
      }
      axios.get(`/myAlfred/api/studio/action-allowed/${action}?dataId=${value?._id}&actionProps=${JSON.stringify(actionProps)}`)
        .then(res => setActionAllowed(res.data.allowed))
        .catch(err => console.error(err))
    }

    useEffect(()=> {
      checkStatus()
    }, [action, value, visible])

    if (action) {
      onClick = () => {
        if (!ACTIONS[action]) {
          return displayError({toast, message:`Undefined action ${action}`})
        }
        setInsideAction(true)
        return ACTIONS[action]({
          ...props,
          value: value,
          props: actionProps,
          context,
          dataModel,
          query,
          model: props.dataModel,
          fireClear: props.fireClear,
        })
          .then(res => {
            if (props.confirmationmessage && MESSAGES[action]) {
              displaySuccess({toast, message: MESSAGES[action]})
            }
            if (!nextAction) {
              return true
            }
            const params = {
              ...props,
              value: res,
              props: nextActionProps,
              context,
              dataModel,
              query,
              model: props.dataModel,
              fireClear: props.fireClear,
              ...res,
            }
            return ACTIONS[nextAction](params)
          })
          .then(() => {
            if (props.confirmationmessage && MESSAGES[nextAction]) {
              displaySuccess({toast, message: MESSAGES[nextAction]})
            }
            if (action!='openPage' && nextAction!='openPage') {
              console.log(`Action ${action} fires reload`)
              props.reload()
            }
            else {
              console.log(`Action ${action} does not fire reload`)
            }
          })
          .catch(err => {
            console.error(err)
            if (err.response?.status!=502) {
              displayError({toast, message: err.response?.data || err})
            }
          })
          .finally(() => {
            setInsideAction(false)
          })
      }
    }
    const conditionalProperties = getConditionalProperties(
      props,
      props.dataSource,
    )

    // Hide if action unavailable and hideIfForbidden is set
    if (props.hideIfForbidden && !actionAllowed) {
      return null
    }
    return (
      <Component disabled={!actionAllowed}
        {...props}
        onClick={lodash.debounce(onClick, 200)} //For Calendar, ensure value had time to update
        {...conditionalProperties}
        isLoading={insideAction}
        ref={targetRef}
      />
    )
  }

  return Internal
}

export default withDynamicButton
