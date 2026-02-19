import { useEffect, useState } from 'react'
import getSessionCookie from './helpers/get-session-cookie'

// ToDo: when do we want to start showing warning -fixed or relative to cookie time
const WARNING_THRESHOLD_IN_SECONDS = 20
const CHECK_INTERVAL = 1 * 1000 // ms countdown every second
export const useCheckCookie = () => {
    const [time, setTime] = useState(Infinity)

    const [expired, setExpired] = useState(false)

    console.log('[Session] useCheckCookie')
    useEffect(() => {
        const interval = setInterval(() => {
            const sessionTimeout = getSessionCookie()
            const remainingSeconds = Math.round(
                (sessionTimeout - Date.now()) / 1000
            )
            if (Date.now() >= sessionTimeout || isNaN(sessionTimeout)) {
                setExpired(true)
                clearInterval(interval)
                setTime(remainingSeconds)
                return
            }

            const endDate = new Date(sessionTimeout).toLocaleTimeString()
            console.log(
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
    }
}
