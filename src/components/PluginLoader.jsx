import { useAlert, useConfig } from '@dhis2/app-runtime'
// eslint-disable-next-line import/no-unresolved
import { Plugin } from '@dhis2/app-runtime/experimental'
import { CircularLoader, CenteredContent, NoticeBox } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useCallback, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router'
import { useClientOfflineInterface } from '../lib/clientPWAUpdateState.jsx'
import i18n from '../locales/index.js'
import styles from './PluginLoader.module.css'

// Doesn't work on maintenance app
// Doesn't work cross-domain
const injectHeaderbarHidingStyles = (event) => {
    try {
        const iframe = event?.target || document.querySelector('iframe')
        const doc = iframe.contentDocument
        const styleElement = doc.createElement('style')
        styleElement.textContent =
            // adapter bar with directional styles
            'div.app-shell-adapter > div > header,\n' +
            // older adapter
            'div.app-shell-adapter > header { display: none; }'
        doc.head.appendChild(styleElement)
    } catch (err) {
        // todo: hide global shell header bar here, in favor of app's
        console.error(
            'Failed to apply styles to the client app to hide its header bar. ' +
                'This could be due to the client app being hosted on a different domain.',
            err
        )
    }
}

// todo: this is kinda duplicated between here and the header bar
const getAppDefaultAction = (appName, modules) => {
    // If core apps get a different naming scheme, this needs revisiting
    return modules.find(
        (m) => m.name === appName || m.name === 'dhis-web-' + appName
    )?.defaultAction
}

const getPluginEntrypoint = (appName, modules /* baseUrl */) => {
    const defaultAction = getAppDefaultAction(appName, modules)

    // todo: app.html handling ----
    // todo: this could be better if this can be detected from app entrypoints API
    // const defaultAppUrl = new URL(defaultAction, baseUrl)
    // const pluginifiedAppUrl = new URL('./app.html', defaultAppUrl)

    // Start by trying to load pluginified app, `app.html`
    // const pluginifiedAppResponse = await fetch(pluginifiedAppUrl)
    // if (pluginifiedAppResponse.ok) {
    //     return pluginifiedAppUrl.href
    // }

    // If pluginified app is not found, fall back to app root
    return defaultAction
}

const watchForHashRouteChanges = (event) => {
    const iframe = event?.target || document.querySelector('iframe')

    iframe.contentWindow.addEventListener('popstate', (event) => {
        // Note: this updates the pluginSource on the Plugin component;
        // check if this causes rerenders. Seems okay in a Dashboard
        window.location.hash = event.target.location.hash
    })
}

const listenForCommandPaletteToggle = (event) => {
    if (window.toggleCommandPaletteListener) {
        event.target.contentDocument.addEventListener(
            'keydown',
            window.toggleCommandPaletteListener
        )
    }
}

/**
 * ⭐️ This is what redirects back to the regular login app when logged out ⭐️
 *
 * If the iframe loads a page that is different from the pluginSource given to
 * it, navigate the whole page there. This should handle two cases:
 * 1. The navigation is outside the DHIS2 instance: we want to leave the shell
 * (this requires access to that page's contentWindow though, which is checked
 * in the onLoad handler)
 * 2. The navigation is to another app: the backend will reroute to the global
 * shell with the right app
 * 3. The backend redirects to the login page: send the app there
 *
 * This should be called on `load` events in the iframe, which indicates some
 * kind of page navigation; this won't trigger on hash route changes.
 *
 * Returns `true` if navigating
 */
const handleExternalNavigation = (iframeLoadEvent, pluginHref) => {
    const iframeHref = iframeLoadEvent.target.contentDocument?.location?.href
    if (iframeHref !== pluginHref) {
        window.location.href = iframeHref
        return true
    }
}

export const PluginLoader = ({ appsInfoQuery }) => {
    const params = useParams()
    const location = useLocation()
    const { baseUrl } = useConfig()
    const [rerenderKey, setRerenderKey] = useState(0)
    const { show: showNavigationWarning } = useAlert(
        i18n.t(
            'Unable to load the requested page from DHIS2. Returned to previous page.'
        ),
        { warning: true }
    )
    const initClientOfflineInterface = useClientOfflineInterface()
    const [error, setError] = useState()

    // test prop messaging and updates
    const [color, setColor] = useState('blue')
    const toggleColor = useCallback(
        () => setColor((prev) => (prev === 'blue' ? 'red' : 'blue')),
        []
    )

    const pluginHref = useMemo(() => {
        if (!appsInfoQuery.data) {
            return
        }

        // for testing: params.appName === 'localApp' ? 'http://localhost:3001/app.html'
        const newPluginEntrypoint = getPluginEntrypoint(
            params.appName,
            appsInfoQuery.data.appMenu.modules,
            baseUrl
        )

        if (!newPluginEntrypoint) {
            console.error(
                `The app slug "${params.appName}" did not match any app. Redirecting to the home page in 5 seconds`
            )
            setError(
                i18n.t(
                    'Unable to find an app for this URL. Redirecting to home page.'
                )
            )
            setTimeout(() => {
                window.location.href = baseUrl
            }, 5000)
            return
        }

        // An absolute URL helps compare to the location inside the iframe:
        const pluginUrl = new URL(newPluginEntrypoint, window.location)
        pluginUrl.hash = location.hash
        pluginUrl.search = location.search
        pluginUrl.searchParams.append('redirect', 'false')

        return pluginUrl.href
    }, [
        location.hash,
        location.search,
        appsInfoQuery.data,
        baseUrl,
        params.appName,
    ])

    const handleLoad = useCallback(
        (event) => {
            // If we can't access the new page's Document, this is a cross-domain page.
            // Disallow that; return to previous plugin state.
            // todo: can cause an infinite reload if the current pluginHref loads
            // an entirely broken page -- this is a rare case though; one example is
            // a PWA app where the precache has been deleted. 404s are fine.
            if (!event.target.contentDocument) {
                setRerenderKey((k) => k + 1)
                showNavigationWarning()
                console.error(
                    'The linked page is not accessible by the DHIS2 global shell; returned to previous plugin state. ' +
                        'This link should be opened in a new tab instead'
                )
                return
            }

            if (handleExternalNavigation(event, pluginHref)) {
                return
            }
            injectHeaderbarHidingStyles(event)
            watchForHashRouteChanges(event)
            initClientOfflineInterface({
                clientWindow: event.target.contentWindow,
            })
            listenForCommandPaletteToggle(event)
        },
        [pluginHref, showNavigationWarning, initClientOfflineInterface]
    )

    if (error) {
        return (
            <CenteredContent>
                <NoticeBox title={i18n.t('Something went wrong')} error>
                    <div className={styles.marginBottom}>{error}</div>
                    <CircularLoader small />
                </NoticeBox>
            </CenteredContent>
        )
    }

    if (!pluginHref) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    return (
        <Plugin
            className={styles.flexGrow}
            // pass URL hash down to the client app
            pluginSource={pluginHref}
            onLoad={handleLoad}
            key={rerenderKey}
            // Other props
            // (for testing:)
            color={color}
            toggleColor={toggleColor}
        />
    )
}
PluginLoader.propTypes = { appsInfoQuery: PropTypes.object }
