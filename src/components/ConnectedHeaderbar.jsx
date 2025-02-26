import { usePWAUpdateState } from '@dhis2/pwa'
import { HeaderBar } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useClientPWAUpdateState } from '../lib/clientPWAUpdateState.jsx'
import { ConfirmUpdateModal } from './ConfirmUpdateModal.tsx'

const getAppDisplayName = (appName, modules) => {
    // todo: check this out if core apps get a different naming scheme
    return modules.find(
        (m) => m.name === appName || m.name === 'dhis-web-' + appName
    )?.displayName
}

// currently, not all core apps are included in the api/apps response
const getAppVersion = (appName, apps) => {
    const parsedAppName = appName.replace('dhis-web-', '')
    return apps.find((a) => a.short_name === parsedAppName)?.version
}

// todo:
// type PWAUpdateState = {
//     updateAvailable: boolean
//     confirmReload: () => void
//     confirmationRequired: boolean
//     clientsCount: number | null
//     onConfirmUpdate: () => void
//     onCancelUpdate: () => void
// }

/**
 * Copied from ConnectedHeaderBar in app adapter:
 * Check for SW updates or a first activation, displaying an update notification
 * message in the HeaderBar profile menu. Does this both for this app itself,
 * and for the client app.
 *
 * When an update is applied, if there are multiple tabs of this app open,
 * there's anadditional warning step because all clients of the service worker
 * will reload when there's an update, which may cause data loss.
 */
export function ConnectedHeaderBar({ appsInfoQuery }) {
    const params = useParams()
    const clientPWAUpdateState = useClientPWAUpdateState()
    const clientPWAUpdateAvailable = clientPWAUpdateState.updateAvailable
    const {
        updateAvailable: selfUpdateAvailable,
        confirmReload,
        confirmationRequired: selfConfirmationRequired,
        clientsCount,
        onConfirmUpdate,
        onCancelUpdate,
    } = usePWAUpdateState()

    const appName = useMemo(() => {
        if (!params.appName || !appsInfoQuery.data) {
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
    }, [appsInfoQuery.data, params.appName])

    // Set new displayname to page title when it updates
    useEffect(() => {
        if (appName) {
            document.title = `${appName} | DHIS2`
        }
    }, [appName])

    const appVersion = useMemo(() => {
        if (!params.appName || !appsInfoQuery.data) {
            return
        }
        return getAppVersion(params.appName, appsInfoQuery.data.apps)
    }, [appsInfoQuery.data, params.appName])

    // Choose the right handler
    const handleApplyAvailableUpdate = useMemo(() => {
        if (clientPWAUpdateAvailable && !selfUpdateAvailable) {
            return clientPWAUpdateState.confirmReload
        }
        // If there's an update ready for both the global shell and the client,
        // updating the global shell will handle the client updates as they
        // will all get reloaded
        return confirmReload
    }, [
        clientPWAUpdateAvailable,
        clientPWAUpdateState.confirmReload,
        selfUpdateAvailable,
        confirmReload,
    ])

    // todo: differentiate between which apps have updates available;
    // todo: tidy these up
    const updateAvailable = selfUpdateAvailable || clientPWAUpdateAvailable

    const confirmationRequired = selfUpdateAvailable
        ? selfConfirmationRequired
        : clientPWAUpdateAvailable
        ? clientPWAUpdateState.confirmationRequired
        : false

    const resolvedClientsCount = selfUpdateAvailable
        ? clientsCount
        : clientPWAUpdateAvailable
        ? clientPWAUpdateState.clientsCount
        : 0

    const handleConfirm = selfUpdateAvailable
        ? onConfirmUpdate
        : clientPWAUpdateAvailable
        ? clientPWAUpdateState.onConfirmUpdate
        : 0

    const handleCancel = selfUpdateAvailable
        ? onCancelUpdate
        : clientPWAUpdateAvailable
        ? clientPWAUpdateState.onCancelUpdate
        : 0

    return (
        <>
            <HeaderBar
                className={'global-shell-header'}
                appName={appName}
                // todo: currently not used by the component
                appVersion={appVersion}
                updateAvailable={updateAvailable}
                onApplyAvailableUpdate={handleApplyAvailableUpdate}
            />
            {confirmationRequired ? (
                <ConfirmUpdateModal
                    clientsCount={resolvedClientsCount}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            ) : null}
        </>
    )
}
ConnectedHeaderBar.propTypes = { appsInfoQuery: PropTypes.object }
