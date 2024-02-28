import { useConfig } from '@dhis2/app-runtime'
// eslint-disable-next-line import/no-unresolved
import { Plugin } from '@dhis2/app-runtime/experimental'
import PropTypes from 'prop-types'
import React from 'react'
import {
    BrowserRouter,
    Routes,
    Route,
    useLocation,
    Link,
    useParams,
} from 'react-router-dom'
import styles from './App.module.css'
import { ConnectedHeaderBar } from './components/ConnectedHeaderbar.js'

// Doesn't work on maintenance app
// Doesn't work cross-domain
const injectHeaderbarHidingStyles = (event) => {
    try {
        const iframe = event?.target || document.querySelector('iframe')
        const doc = iframe.contentDocument
        const styleElement = doc.createElement('style')
        styleElement.textContent =
            'div.app-shell-adapter > header { display: none; }'
        doc.head.appendChild(styleElement)
    } catch (err) {
        console.error(
            'Failed to apply styles to the client app to hide its header bar. ' +
                'This could be due to the client app being hosted on a different domain.',
            err
        )
    }
}

const Layout = ({
    children,
    clientPWAUpdateAvailable,
    onApplyClientUpdate,
}) => {
    return (
        <>
            <ConnectedHeaderBar
                clientPWAUpdateAvailable={clientPWAUpdateAvailable}
                onApplyClientUpdate={onApplyClientUpdate}
            />
            <div className={styles.container}>{children}</div>
        </>
    )
}
Layout.propTypes = {
    children: PropTypes.node,
    clientPWAUpdateAvailable: PropTypes.bool,
    onApplyClientUpdate: PropTypes.func,
}

// Save this so it can be used after browser URL changes
const originalLocation = new URL(window.location.href)

const getPluginSource = async (appName, baseUrl) => {
    const absoluteBaseUrl = new URL(baseUrl, originalLocation)

    if (appName.startsWith('dhis-web')) {
        console.log({ appName })

        // todo: this could be done with smarter apps info API
        // (neither api/apps/menu nor getModules.action have all correct answers)
        const relativePath =
            appName === 'dhis-web-dataentry'
                ? `./${appName}/index.action`
                : `./${appName}/`
        return new URL(relativePath, absoluteBaseUrl).href
    }

    const appBasePath = appName.startsWith('dhis-web')
        ? `./${appName}/`
        : `./api/apps/${appName}/`
    const appRootUrl = new URL(appBasePath, absoluteBaseUrl)
    const pluginifiedAppEntrypoint = new URL('./app.html', appRootUrl)

    const pluginifiedAppResponse = await fetch(pluginifiedAppEntrypoint)
    if (pluginifiedAppResponse.ok) {
        return pluginifiedAppEntrypoint.href
    }
    // If pluginified app is not found, fall back to app root
    return appRootUrl.href
}

const PluginLoader = ({
    setClientPWAUpdateAvailable,
    setOnApplyClientUpdate,
}) => {
    const params = useParams()
    const location = useLocation()
    const { baseUrl } = useConfig()
    const [pluginSource, setPluginSource] = React.useState()

    // test prop messaging and updates
    const [color, setColor] = React.useState('blue')
    const toggleColor = React.useCallback(
        () => setColor((prev) => (prev === 'blue' ? 'red' : 'blue')),
        []
    )

    React.useEffect(() => {
        const asyncWork = async () => {
            const newPluginSource =
                params.appName === 'localApp'
                    ? 'http://localhost:3001/app.html'
                    : await getPluginSource(params.appName, baseUrl)
            setPluginSource(newPluginSource)
        }
        asyncWork()
    }, [params.appName, baseUrl])

    return (
        <Plugin
            width={'100%'}
            height={'100%'}
            // todo: only for apps without header bars
            // height={'calc(100% - 48px)'}
            // pass URL hash down to the client app
            pluginSource={pluginSource + location.hash}
            onLoad={injectHeaderbarHidingStyles}
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
    setClientPWAUpdateAvailable: PropTypes.func,
    setOnApplyClientUpdate: PropTypes.func,
}

// todo: also listen to navigations inside iframe (e.g. "Open this dashboard item in DV" links)
// (Could the `window` prop on BrowserRouter help here?)
const MyApp = () => {
    const { baseUrl, appName } = useConfig()
    // todo: maybe pare this down to just onApplyUpdate?
    // todo: reset upon switching to a new client app
    const [clientPWAUpdateAvailable, setClientPWAUpdateAvailable] =
        React.useState(false)
    const [onApplyClientUpdate, setOnApplyClientUpdate] = React.useState()

    const basename = React.useMemo(() => {
        if (process.env.NODE_ENV === 'development') {
            return // undefined is okay
        }
        const absoluteBaseUrl = new URL(baseUrl, originalLocation)
        return new URL(`./api/apps/${appName}/`, absoluteBaseUrl).pathname
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <BrowserRouter basename={basename}>
            <Layout
                clientPWAUpdateAvailable={clientPWAUpdateAvailable}
                onApplyClientUpdate={onApplyClientUpdate}
            >
                <Routes>
                    <Route
                        path="*"
                        element={<Link to="/app/localApp">Local App</Link>}
                    ></Route>
                    <Route
                        path="/app/:appName"
                        element={
                            <PluginLoader
                                setClientPWAUpdateAvailable={
                                    setClientPWAUpdateAvailable
                                }
                                setOnApplyClientUpdate={setOnApplyClientUpdate}
                            />
                        }
                    />
                </Routes>
            </Layout>
        </BrowserRouter>
    )
}

export default MyApp
