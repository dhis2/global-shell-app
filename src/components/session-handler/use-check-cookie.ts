import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import getSessionCookie from './helpers/get-session-cookie'

const CHECK_INTERVAL = 1 * 1000 // ms countdown every second
const MIN_WARNING_THRESHOLD = 20
const MAX_WARNING_THRESHOLD = 5 * 60
export const useCheckCookie = (sessionTimeoutInSeconds: number) => {
    const [time, setTime] = useState<number>()
    const warningThresholdInSeconds = useMemo(() => {
        let threshold = Math.round(sessionTimeoutInSeconds * 0.1)
        threshold = Math.min(
            Math.max(threshold, MIN_WARNING_THRESHOLD),
            MAX_WARNING_THRESHOLD
        )
        return threshold
    }, [sessionTimeoutInSeconds])

    const [expired, setExpired] = useState(false)

    const sessionExpiryTimeValue = useRef<number | undefined>(undefined)

    const reset = useCallback(() => {
        const { sessionExpiryTime } = getSessionCookie() ?? {}
        if (sessionExpiryTime) {
            setTime(sessionTimeoutInSeconds)
        }
    }, [sessionTimeoutInSeconds])

    useEffect(() => {
        reset()
    }, [reset, warningThresholdInSeconds])

    useEffect(() => {
        if (!time) {
            return
        }
        const interval = setInterval(() => {
            const sessionExpiryTime = getSessionCookie()?.sessionExpiryTime

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
