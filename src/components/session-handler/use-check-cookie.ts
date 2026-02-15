import { useEffect, useRef, useState } from 'react'

// const WARNING_THRESHOLD_IN_SECONDS = 20
const CHECK_INTERVAL = 1000 // ms countdown every second
export const useCheckCookie = ({ sessionTimeout, warningThreshold }) => {
    const timeout = useRef(sessionTimeout)

    // console.log('??? warningthreshold', warningThresholdSeconds)
    const stime = useRef<number>(timeout.current)
    const [time, setTime] = useState(timeout.current)

    const [expired, setExpired] = useState(false)
    const [warningShown, setShowWarning] = useState(false)

    const reset = () => {
        stime.current = Math.round(sessionTimeout)
        setExpired(false)
        setShowWarning(false)
        setTime(stime.current)
    }
    useEffect(() => {
        const interval = setInterval(() => {
            console.log(`[Session] Remaining seconds: ${stime.current}`)
            setShowWarning(stime.current < warningThreshold)
            if (stime.current === 1) {
                setExpired(true)
                clearInterval(interval)
            }
            stime.current = stime.current - 1
            setTime(stime.current)
        }, CHECK_INTERVAL)

        return () => clearInterval(interval)
    }, [])

    return {
        reset,
        time,
        expired,
        showWarning: warningShown,
    }
}
