import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'

const SESSION_EXPIRY_COOKIE_NAME = 'SESSION_EXPIRE'
const WARNING_THRESHOLD_IN_SECONDS = 20
const CHECK_INTERVAL = 1000 // ms countdown every second
export const useCheckCookie = () => {
    const [time, setTime] = useState(Infinity)

    const [expired, setExpired] = useState(false)

    useEffect(() => {
        // ToDo: much better error handling
        const sessionTimeout =
            Number(Cookies.get(SESSION_EXPIRY_COOKIE_NAME)) * 1000

        console.log(
            `SESSION_EXPIRE value from cookie : ${sessionTimeout} ms (${new Date(
                sessionTimeout
            )})`
        )

        const interval = setInterval(() => {
            // ToDo: much better error handling
            const sessionTimeout =
                Number(Cookies.get(SESSION_EXPIRY_COOKIE_NAME)) * 1000

            const remainingSeconds = Math.round(
                (sessionTimeout - Date.now()) / 1000
            )
            console.log(`session  (remaining seconds): ${remainingSeconds}`)
            if (Date.now() > sessionTimeout) {
                // if (remainingSeconds < 290) {
                // console.log(
                //     '>>>>>>>>> fake time out when remaininSeconds  <  3540!'
                // )
                setExpired(true)
                clearInterval(interval)
            }
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
