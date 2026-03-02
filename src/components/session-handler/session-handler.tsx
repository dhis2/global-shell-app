import { useDataQuery } from '@dhis2/app-runtime'
import * as React from 'react'
import { ExpirationCountdownModal } from './modal-countdown'
import { ExpiredModal } from './modal-expired'
import { useCheckCookie } from './use-check-cookie'

const query = {
    user: {
        resource: 'me',
        params: {
            fields: ['name'],
        },
    },
}

type SessionHandlerProps = {
    sessionTimeoutInSeconds: number
}

export const SessionHandler: React.FC<SessionHandlerProps> = ({
    sessionTimeoutInSeconds,
}) => {
    const { showWarning, time, expired, reset } = useCheckCookie(
        sessionTimeoutInSeconds
    )
    const [modalHidden, hideModal] = React.useState(false)
    // const [received401, setReceived401] = React.useState(false)

    const { refetch: extendSession, loading } = useDataQuery(query, {
        lazy: true,
    })

    const dismissModal = async () => {
        hideModal(true)
        await extendSession()
        reset()
    }

    if (!expired && showWarning) {
        return (
            <ExpirationCountdownModal
                countDown={time}
                onExtendSession={dismissModal}
                loading={loading}
                sessionTimeout={sessionTimeoutInSeconds}
            />
        )
    }

    // ToDo: unsure - once dismissed, we don't show it again?
    if (expired && !modalHidden) {
        return (
            <ExpiredModal
                sessionTimeout={sessionTimeoutInSeconds}
                dismissModal={dismissModal}
            />
        )
    }
    return null
}
