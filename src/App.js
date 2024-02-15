import { useConfig } from '@dhis2/app-runtime'
// eslint-disable-next-line import/no-unresolved
import { Plugin } from '@dhis2/app-runtime/experimental'
import { HeaderBar } from '@dhis2/ui'
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
        console.error(err)
    }
}

const Layout = ({ children }) => {
    return (
        <>
            <HeaderBar className={'global-shell-header'} />
            <div className={styles.container}>{children}</div>
        </>
    )
}
Layout.propTypes = { children: PropTypes.node }

// Save this so it can be used after browser URL changes
const originalLocation = new URL(window.location.href)

// todo: handle "whiffs" and fall-backs if 'app.html' isn't available
const getPluginSource = (appName, baseUrl) => {
    const absoluteBaseUrl = new URL(baseUrl, originalLocation)

    if (appName.startsWith('dhis-web')) {
        return new URL(`./${appName}/`, absoluteBaseUrl).href
    }

    return new URL(`./api/apps/${appName}/app.html`, absoluteBaseUrl).href
}

const PluginLoader = () => {
    const params = useParams()
    const location = useLocation()
    const { baseUrl } = useConfig()

    const pluginSource = React.useMemo(() => {
        const pluginSource =
            params.appName === 'localApp'
                ? 'http://localhost:3001/app.html'
                : getPluginSource(params.appName, baseUrl)
        return pluginSource + location.hash
    }, [params.appName, baseUrl, location.hash])

    return (
        <Plugin
            width={'100%'}
            height={'100%'}
            pluginSource={pluginSource}
            onLoad={injectHeaderbarHidingStyles}
        />
    )
}

// todo: also listen to navigations inside iframe (e.g. "Open this dashboard item in DV" links)
// (Could the `window` prop on BrowserRouter help here?)
const MyApp = () => {
    const { baseUrl, appName } = useConfig()

    const basename = React.useMemo(() => {
        if (process.env.NODE_ENV === 'development') {
            return // undefined is okay
        }
        const absoluteBaseUrl = new URL(baseUrl, originalLocation)
        return new URL(`./api/apps/${appName}/`, absoluteBaseUrl).pathname
    }, [])

    return (
        <BrowserRouter basename={basename}>
            <Layout>
                <Routes>
                    <Route
                        path="*"
                        element={<Link to="/app/localApp">Local App</Link>}
                    ></Route>
                    <Route path="/app/:appName" element={<PluginLoader />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    )
}

export default MyApp
