import { useConfig } from '@dhis2/app-runtime'
import { usePWAUpdateState } from '@dhis2/pwa'
import { HeaderBar } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
// import { usePWAUpdateState } from '../utils/usePWAUpdateState'
import { ConfirmUpdateModal } from './ConfirmUpdateModal.js'

/**
 * Check for SW updates or a first activation, displaying an update notification
 * message in the HeaderBar profile menu. When an update is applied, if there are
 * multiple tabs of this app open, there's anadditional warning step because all
 * clients of the service worker will reload when there's an update, which may
 * cause data loss.
 */

export function ConnectedHeaderBar({
    clientPWAUpdateAvailable,
    onApplyClientUpdate,
}) {
    const { appName } = useConfig()
    const {
        updateAvailable: selfUpdateAvailable,
        confirmReload,
        confirmationRequired,
        clientsCount,
        onConfirmUpdate,
        onCancelUpdate,
    } = usePWAUpdateState()

    // Choose the right handler
    const handleApplyAvailableUpdate = React.useMemo(() => {
        if (clientPWAUpdateAvailable && !selfUpdateAvailable) {
            return onApplyClientUpdate
        }
        // If there's an update ready for both the global shell and the client,
        // updating the global shell will handle the client updates as they
        // will all get reloaded
        return confirmReload
    }, [
        clientPWAUpdateAvailable,
        selfUpdateAvailable,
        confirmReload,
        onApplyClientUpdate,
    ])

    const updateAvailable = selfUpdateAvailable || clientPWAUpdateAvailable

    return (
        <>
            <HeaderBar
                className={'global-shell-header'}
                appName={appName}
                updateAvailable={updateAvailable}
                onApplyAvailableUpdate={handleApplyAvailableUpdate}
            />
            {/* The following is used for global shell updates -- */}
            {/* the client app will handle its own confirmation modal */}
            {confirmationRequired ? (
                <ConfirmUpdateModal
                    clientsCount={clientsCount}
                    onConfirm={onConfirmUpdate}
                    onCancel={onCancelUpdate}
                />
            ) : null}
        </>
    )
}
ConnectedHeaderBar.propTypes = {
    clientPWAUpdateAvailable: PropTypes.bool,
    onApplyClientUpdate: PropTypes.func,
}
