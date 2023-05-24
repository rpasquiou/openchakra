import React, {useState, useEffect} from 'react'
import { TOPIC_PREFIX, SEPARATOR, ALL_SUFFIX } from './config';
import { handleSubscription, Topics } from '.';


const INITIAL_TOPIC = {
  name: ALL_SUFFIX, 
  permanent: true
}

const NotifContainer = ({user: currentUser, all, start, children, ...rest}:{
  user?: object | null,
  all?: boolean,
  start?: boolean, /** notifications to all users on start */
  rest?: any,
  children?: React.ReactChildren
}) => {

  const [topicsToHandle, setTopicsToHandle] = useState<Topics>([])

  useEffect(() => {
    handleSubscription({topicsToHandle, back: false}) 
  }, [])


  useEffect(() => {
    if (topicsToHandle.length > 0) {
      currentUser 
        ? handleSubscription({topicsToHandle, back: false}) 
        : handleSubscription({topicsToHandle, back: true})
    }
  }, [currentUser, topicsToHandle])

  // Handle topics 
  useEffect(() => {
    if (currentUser) {
      const topicsToRegister = gentopics({user: currentUser?._id})
      setTopicsToHandle(topicsToRegister)
    }
  }, [currentUser])

  // Notifications for all users on start
  useEffect(() => {
    if (start) {
      handleSubscription({topicsToHandle: gentopics({user: currentUser?._id}), back: false}) 
    }
  }, [])

  return (
    <>
    {children}
    </>
  )
}

const gentopics = ({user = ''}: {user?: string}): Topics => {

  // TODO admit that if it contains ALL_SUFFIX, it's permanent ?

  const currentSuffixTopics = user ? [
    {
      name: user, 
      permanent: false 
    }, 
    INITIAL_TOPIC
  ] : [INITIAL_TOPIC]
  
  // @ts-ignore
  return currentSuffixTopics.reduce((acc, topic) => [
    ...acc, 
    {
      permanent: topic?.permanent,
      name: TOPIC_PREFIX + SEPARATOR + topic?.name
    }
  ], [])
}


export default NotifContainer



