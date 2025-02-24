import { useAlert, useConfig } from '@dhis2/app-runtime'
// eslint-disable-next-line import/no-unresolved
import { Plugin } from '@dhis2/app-runtime/experimental'
import PropTypes from 'prop-types'
import React from 'react'
import { useLocation, useParams } from 'react-router-dom'
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

// todo: why is there a request to /apps/undefined?redirect=false
const getPluginEntrypoint = async (appName, modules /* baseUrl */) => {
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

/**
 * If the iframe loads a page that is different from the pluginSource given to
 * it, navigate the whole page there. This should handle two cases:
 * 1. The navigation is outside the DHIS2 instance: we want to leave the shell
 * (this requires access to that page's contentWindow though, which is checked
 * in the onLoad handler)
 * 2. The navigation is to another app: the backend will reroute to the global
 * shell with the right app
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

export const PluginLoader = ({
    setClientPWAUpdateAvailable,
    setOnApplyClientUpdate,
    appsInfoQuery,
}) => {
    const params = useParams()
    const location = useLocation()
    const { baseUrl } = useConfig()
    const [pluginEntrypoint, setPluginEntrypoint] = React.useState()
    const [rerenderKey, setRerenderKey] = React.useState(0)
    const { show: showNavigationWarning } = useAlert(
        i18n.t(
            'Unable to load the requested page from DHIS2. Returned to previous page.'
        ),
        { warning: true }
    )

    // test prop messaging and updates
    const [color, setColor] = React.useState('blue')
    const toggleColor = React.useCallback(
        () => setColor((prev) => (prev === 'blue' ? 'red' : 'blue')),
        []
    )

    // todo: add query string to entrypoint (e.g. maps /dhis-web-maps/?currentAnalyticalObject=true)
    // Can use `urlObject.searchParams.append('redirect', 'false')`
    // (or is this a backend thing?)
    React.useEffect(() => {
        if (!appsInfoQuery.data) {
            return
        }
        // Performed async to test for index/app entrypoint
        // todo: this could be better if this can be detected from app entrypoints API
        const asyncWork = async () => {
            // for testing: params.appName === 'localApp' ? 'http://localhost:3001/app.html'
            const newPluginEntrypoint = await getPluginEntrypoint(
                params.appName,
                appsInfoQuery.data.appMenu.modules,
                baseUrl
            )
            setPluginEntrypoint(newPluginEntrypoint)
        }
        asyncWork()
    }, [params.appName, baseUrl, appsInfoQuery.data])

    const pluginHref = React.useMemo(() => {
        // An absolute URL helps compare to the location inside the iframe:
        const pluginUrl = new URL(pluginEntrypoint, window.location)
        pluginUrl.hash = location.hash
        pluginUrl.search = location.search
        pluginUrl.searchParams.append('redirect', 'false')
        return pluginUrl.href
    }, [pluginEntrypoint, location.hash, location.search])

    const handleLoad = React.useCallback(
        (event) => {
            // If we can't access the new page's Document, this is a cross-domain page.
            // Disallow that; return to previous plugin state
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
        },
        [pluginHref, showNavigationWarning]
    )

    if (!pluginHref) {
        return 'Loading...' // todo
    }

    return (
        <Plugin
            className={styles.flexGrow}
            // pass URL hash down to the client app
            pluginSource={pluginHref}
            onLoad={handleLoad}
            key={rerenderKey}
            // Other props
            reportPWAUpdateStatus={(data) => {
                const { updateAvailable, onApplyUpdate } = data
                console.log('recieved PWA status', { data })

                setClientPWAUpdateAvailable(updateAvailable)
                if (onApplyUpdate) {
                    // Return function from a function -- otherwise, setState tries to invoke the function
                    // to evaluate its next state
                    setOnApplyClientUpdate(() => onApplyUpdate)
                }
            }}
            // props test
            color={color}
            toggleColor={toggleColor}
        />
    )
}
PluginLoader.propTypes = {
    appsInfoQuery: PropTypes.object,
    setClientPWAUpdateAvailable: PropTypes.func,
    setOnApplyClientUpdate: PropTypes.func,
}
