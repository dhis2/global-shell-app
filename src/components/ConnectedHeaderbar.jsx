import { usePWAUpdateState } from '@dhis2/pwa'
import { HeaderBar } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useParams } from 'react-router-dom'
import { ConfirmUpdateModal } from './ConfirmUpdateModal.jsx'

/**
 * Copied from ConnectedHeaderBar in app adapter:
 * Check for SW updates or a first activation, displaying an update notification
 * message in the HeaderBar profile menu. When an update is applied, if there are
 * multiple tabs of this app open, there's anadditional warning step because all
 * clients of the service worker will reload when there's an update, which may
 * cause data loss.
 */

const getAppDisplayName = (appName, modules) => {
    // todo: check this out if core apps get a different naming scheme
    return modules.find(
        (m) => m.name === appName || m.name === 'dhis-web-' + appName
    )?.displayName
}

export function ConnectedHeaderBar({
    clientPWAUpdateAvailable,
    onApplyClientUpdate,
    appsInfoQuery,
}) {
    const params = useParams()
    const {
        updateAvailable: selfUpdateAvailable,
        confirmReload,
        confirmationRequired,
        clientsCount,
        onConfirmUpdate,
        onCancelUpdate,
    } = usePWAUpdateState()

    const appName = React.useMemo(() => {
        if (!params.appName) {
            // `undefined` defaults to app title in header bar component, i.e. "Global Shell"
            return
        }
        if (appsInfoQuery.data) {
            return getAppDisplayName(
                params.appName,
                appsInfoQuery.data.appMenu.modules
            )
        }
        return params.appName
    }, [appsInfoQuery.data, params])

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
    appsInfoQuery: PropTypes.object,
    clientPWAUpdateAvailable: PropTypes.bool,
    onApplyClientUpdate: PropTypes.func,
}
