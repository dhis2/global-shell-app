import { useCallback, useEffect, useRef, useState } from 'react'
import calculateSkew from './helpers/calculate-skew'
import getSessionCookie from './helpers/get-session-cookie'

// ToDo: when do we want to start showing warning -fixed or relative to cookie time
const WARNING_THRESHOLD_IN_SECONDS = 20
const CHECK_INTERVAL = 1 * 1000 // ms countdown every second
export const useCheckCookie = () => {
    const [time, setTime] = useState(Infinity)

    const [expired, setExpired] = useState(false)
    const skew = useRef(0)

    const reset = useCallback(() => {
        // calculate the skew only once
        const { serverTime } = getSessionCookie()
        if (serverTime) {
            const calculatedSkew = calculateSkew(serverTime)
            skew.current = calculatedSkew
            console.debug('[session] calculated skew:', skew.current)
        }
    }, [])

    console.debug('[Session] ...')
    useEffect(() => {
        reset()
    }, [])
    useEffect(() => {
        const interval = setInterval(() => {
            const nowDate = Date.now() - skew.current
            const { sessionExpiryTime = NaN } = getSessionCookie()

            const remainingSeconds = Math.round(
                (sessionExpiryTime - nowDate) / 1000
            )

            if (nowDate >= sessionExpiryTime || isNaN(sessionExpiryTime)) {
                setExpired(true)
                clearInterval(interval)
                setTime(remainingSeconds)
                return
            }

            const endDate = new Date(sessionExpiryTime).toLocaleTimeString()
            console.debug(
                `[Session] Cookie time stamp: ${endDate} / ${remainingSeconds} seconds`
            )

            setTime(remainingSeconds)
        }, CHECK_INTERVAL)

        return () => clearInterval(interval)
    }, [])

    return {
        time,
        expired,
        showWarning: time < WARNING_THRESHOLD_IN_SECONDS,
        reset,
    }
}
