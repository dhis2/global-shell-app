import * as React from 'react'
import { ExpiredModal } from './modal-expired'
import { useCheckCookie } from './use-check-cookie'
import { ExpirationCountdownModal } from './modal-countdown'

export const SessionHandler = () => {
    const { showWarning, time, expired } = useCheckCookie()
    const [modalHidden, hideModal] = React.useState(false)
    const [received401, setReceived401] = React.useState(false)

    if (!expired && showWarning) {
        return <ExpirationCountdownModal countDown={time} />
    }
    if ((expired || received401) && !modalHidden) {
        return <ExpiredModal dismissModal={() => hideModal(true)} />
    }
    return null
}
