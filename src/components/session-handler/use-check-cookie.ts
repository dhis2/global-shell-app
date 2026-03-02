import { useCallback, useEffect, useRef, useState } from 'react'
import getSessionCookie from './helpers/get-session-cookie'

const CHECK_INTERVAL = 1 * 1000 // ms countdown every second

export const useCheckCookie = (sessionTimeoutInSeconds: number) => {
    const [time, setTime] = useState<number>()
    const warningThresholdInSeconds = Math.round(sessionTimeoutInSeconds * 0.1)

    const [expired, setExpired] = useState(false)

    const sessionExpiryTimeValue = useRef<number | undefined>(undefined)

    const reset = useCallback(() => {
        const { sessionExpiryTime } = getSessionCookie() ?? {}
        if (sessionExpiryTime) {
            setTime(sessionTimeoutInSeconds)
        }
    }, [sessionTimeoutInSeconds])

    console.debug('[Session] 4 ...')

    useEffect(() => {
        reset()
    }, [reset])

    useEffect(() => {
        if (!time) {
            return
        }
        const interval = setInterval(() => {
            const sessionExpiryTime = getSessionCookie()?.sessionExpiryTime

            console.log('[session] time', time)

            if (time === 1) {
                setExpired(true)
                clearInterval(interval)
                return
            }

            // in effect, an update to the cookie - regardless of the value of the time out - is an indication to reset the timer
            // the timer resets and counts to the session timeout value (no need to cater for skew)
            if (sessionExpiryTimeValue.current != sessionExpiryTime) {
                reset()
                sessionExpiryTimeValue.current = sessionExpiryTime
            } else if (time > 0) {
                setTime(time - 1)
                return
            }
        }, CHECK_INTERVAL)

        return () => clearInterval(interval)
    }, [reset, time])

    return {
        time,
        expired,
        showWarning: time && time < warningThresholdInSeconds,
        reset,
    }
}
