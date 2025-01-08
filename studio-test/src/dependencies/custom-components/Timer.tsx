import React, { useState, useCallback, useEffect } from 'react'
import { Text } from '@chakra-ui/react'
import { useStopwatch } from 'react-timer-hook'
import useEventListener from '../hooks/useEventListener'
import useInterval from '../hooks/useInterval'
import axios from 'axios'
import moment from 'moment'
/**
 * Timer autostarts on ressource loaded
 * Time sent every X seconds
 */

const Timer = ({
  dataSource,
  attribute,
  ...props
}: {
  dataSource: object | null,
  attribute: string | null,
}) => {
  
  const offsetTimestamp=dataSource?.[attribute] ? moment().add(dataSource?.[attribute], 'second') : undefined
  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    //reset,
  } = useStopwatch({ autoStart: true, offsetTimestamp })

  // Brower code only
  if (typeof window!=='undefined') {
    const RESSOURCE_SENDING_PERIOD = 5000
    // const TIME_BEFORE_LOGOUT = 10000
    // const [coords, setCoords] = useState({ x: 0, y: 0 });
    // const [lastCoords, setLastCoords] = useState({ x: 0, y: 0 });
    // const [lastTyping, setLastTyping] = useState<Date>(new Date());
    const [isVisible, setIsVisible] = useState<boolean>(
      document?.visibilityState !== 'hidden' || false,
    )
    // const handleMoves = useCallback(
    //   ({ clientX, clientY }) => {
    //     setCoords({ x: clientX, y: clientY });
    //   },
    //   [setCoords]
    // );

    // const handleTyping = useCallback(
    //   ({ keyCode }) => {
    //     console.log(keyCode)
    //     setLastTyping(new Date());
    //   },
    //   [setLastTyping]
    // );

    const handleVisibility = useCallback(
      (e: EventListenerOrEventListenerObject) => {
        if (document.visibilityState === 'hidden') {
          setIsVisible(false)
        } else {
          setIsVisible(true)
        }
      },
      [setIsVisible],
    )

    // useEventListener("mousemove", handleMoves);
    // useEventListener("keyup", handleTyping);
    useEventListener('visibilitychange', handleVisibility)

    /* If counter is running, no more ping sent */
    useInterval(
      () => {
        if (dataSource) {
          try {
            axios
              .post(`/myAlfred/api/studio/action`, {
                action: 'addSpentTime',
                id: dataSource._id,
                duration: RESSOURCE_SENDING_PERIOD,
              })
              .catch(err =>
                console.error(`erreur send data time for ${dataSource}:${err}`),
              )
          } catch (err) {
            console.error(err)
          }
        }
      },
      isRunning ? RESSOURCE_SENDING_PERIOD : null,
    )

    /* typing or mousemove or logout */
    // useInterval(() => {
    //   console.log('no interaction')
    // }, isRunning ? TIME_BEFORE_LOGOUT : null)

    useEffect(() => {
      isRunning && !isVisible && pause()
      !isRunning && isVisible && start()
    }, [isRunning, isVisible, pause, start])
  }

  return (
    <div {...props}>{days? `${days}j `: ''}{hours}:{minutes}:{seconds}</div>
  )
}

export default Timer
