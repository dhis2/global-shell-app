import { useConfig } from '@dhis2/app-runtime'
// eslint-disable-next-line import/no-unresolved
import { Plugin } from '@dhis2/app-runtime/experimental'
import { CircularLoader, CenteredContent, NoticeBox } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
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
const getPluginEntrypoint = (appName, modules) => {
    // If core apps get a different naming scheme, this needs revisiting
    return modules.find(
        (m) => m.name === appName || m.name === 'dhis-web-' + appName
    )?.defaultAction
}

const watchForHashRouteChanges = (event) => {
    const iframe = event?.target || document.querySelector('iframe')

    iframe.contentWindow.addEventListener('popstate', (event) => {
        const locationUrl = new URL(window.location)
        const targetHash = event.target.location.hash

        // Only update if hashes have changed
        if (locationUrl.hash !== targetHash) {
            // Update hash in the current location
            locationUrl.hash = targetHash
            // *Replace* here because popstate events in iframes already create
            // history entries in the stack; don't create another one.
            window.location.replace(locationUrl)
        }
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
    const currentUrl = new URL(pluginHref)
    const iframeUrl = new URL(iframeLoadEvent.target.contentWindow?.location)
    // Hash and search aren't as important
    if (
        iframeUrl.origin !== currentUrl.origin ||
        iframeUrl.pathname !== currentUrl.pathname
    ) {
        // Replace to not lose 'forward' history
        window.location.replace(iframeUrl)
        return true
    }
}

const failedLoadErrorMessage =
    'The requested page is not accessible by the DHIS2 global shell, ' +
    'and the URL is therefore inaccessible to be printed here. ' +
    'The server might be down, or the requested page is on a ' +
    'different domain. ' +
    'In the second case, the link should be opened in a new tab instead.'

const redirectErrorMessage = i18n.t('A redirect error was encountered')

export const PluginLoader = ({ appsInfoQuery }) => {
    const { baseUrl } = useConfig()
    const params = useParams()
    const location = useLocation()
    const initClientOfflineInterface = useClientOfflineInterface()
    const [error, setError] = useState(null)
    const [redirectError, setRedirectError] = useState(false)
    const iframeRef = useRef()
    const originalSrcRef = useRef()

    const pluginHref = useMemo(() => {
        if (!appsInfoQuery.data) {
            return
        }
        setError(null)

        // for testing: params.appName === 'localApp' ? 'http://localhost:3001/app.html'
        const newPluginEntrypoint = getPluginEntrypoint(
            params.appName,
            appsInfoQuery.data.appMenu.modules
        )

        if (!newPluginEntrypoint) {
            console.error(
                `The app slug "${params.appName}" did not match any app.`
            )
            setError(i18n.t('Unable to find an app for this URL.'))
            return
        }

        // An absolute URL helps compare to the location inside the iframe:
        const pluginUrl = new URL(newPluginEntrypoint, window.location)
        pluginUrl.hash = location.hash
        pluginUrl.search = location.search

        // If the app in the iframe got redirected back to the iframe, try again
        // with ?redirect=false
        if (redirectError) {
            pluginUrl.searchParams.append('redirect', 'false')
        }

        return pluginUrl.href
    }, [location.hash, location.search, appsInfoQuery.data, params.appName, redirectError])

    const handleLoad = useCallback(
        (event) => {
            iframeRef.current = event.target

            // If we can't access the new page's Document, this is a cross-domain page.
            // Disallow that and show an error
            if (!event.target.contentDocument) {
                setError(
                    i18n.t('The requested page is not accessible from DHIS2.')
                )
                console.error(failedLoadErrorMessage)
                return
            }

            const targetLocation = event.target.contentWindow.location
            const isTryingToLoadGlobalShell = targetLocation.href.startsWith(baseUrl + '/apps/')
            if (isTryingToLoadGlobalShell && redirectError) {
                // If this is the second time in a row we get redirected to the
                // global shell, we're probably in a loop :(
                // Set an error for the UI
                setError(redirectErrorMessage)
                return
            }
            if (isTryingToLoadGlobalShell) {
                // Got redirected to the global shell... Set this error,
                // so pluginHref adds ?redirect=false to the location
                setRedirectError(true)
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
        [pluginHref, initClientOfflineInterface, baseUrl, redirectError]
    )

    useEffect(() => {
        if (!pluginHref) {
            return
        }

        // Set pluginSource one time (subsequent times interfere with history)
        if (originalSrcRef.current === undefined) {
            originalSrcRef.current = pluginHref
            return
        }

        // For further updates, replace iframe window location
        if (iframeRef.current) {
            iframeRef.current.contentWindow.location.replace(pluginHref)
        }
    }, [pluginHref])

    if (error) {
        return (
            <CenteredContent>
                <NoticeBox title={i18n.t('Something went wrong')} error>
                    <div className={styles.marginBottom}>{error}</div>
                    <Link to={'/'} className={styles.link}>
                        {i18n.t('Return to home page')}
                    </Link>
                </NoticeBox>
            </CenteredContent>
        )
    }

    if (!originalSrcRef.current && !pluginHref) {
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
            pluginSource={originalSrcRef.current || pluginHref}
            onLoad={handleLoad}
        />
    )
}
PluginLoader.propTypes = { appsInfoQuery: PropTypes.object }
