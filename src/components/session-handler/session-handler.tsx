import postRobot from 'post-robot'
import * as React from 'react'
import { ExpirationCountdownModal } from './modal-countdown'
import { ExpiredModal } from './modal-expired'
import { useCheckCookie } from './use-check-cookie'

const globalShellBroadcast = new BroadcastChannel('global-shell')
const broadCastMessage = 'BROADCAST_SESSION_EXPIRED'

// ToDO: there is some re-rendering hell going on with the component - still needs some tightening up
export const SessionHandler = ({ sessionTimeout }) => {
    const { showWarning, time, expired, reset } = useCheckCookie({
        sessionTimeout,
        warningThreshold: Number(sessionTimeout) / 10,
    })
    const [modalHidden, hideModal] = React.useState(false)
    const [received401, setReceived401] = React.useState(false)

    globalShellBroadcast.addEventListener('message', (ev) => {
        if (ev.data === broadCastMessage) {
            console.log(
                `[Session] Received broadcast message from another window: "${ev.data}" on channel "${globalShellBroadcast.name}"`
            )
            hideModal(false)
            setReceived401(true)
        }
    })

    React.useEffect(() => {
        postRobot.on('notifyShell', (event) => {
            console.log(
                `   [Session] [API monitor]: ${event?.data?.resource} (${event?.data.status})`
            )
            // todo: check API call are to DHIS2 server specifically?
            if (event?.data?.status == 401) {
                hideModal(false)
                setReceived401(true)
                // todo: should broadcast 2xx to extend session across windows
                globalShellBroadcast.postMessage(broadCastMessage)
            } else {
                reset()
            }
        })
    }, [])

    if (!expired && showWarning) {
        return <ExpirationCountdownModal countDown={time} />
    }
    if ((expired || received401) && !modalHidden) {
        return <ExpiredModal dismissModal={() => hideModal(true)} />
    }
    return null
}
