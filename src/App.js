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

const Layout = ({ children }) => {
    return (
        <div className={styles.container}>
            {/* -> Header Bar could go here <- */}
            <p>
                <Link className={'hay'} to="/">
                    Home
                </Link>{' '}
                <Link to="/app/simple-app">Simple App</Link>{' '}
                <Link to="/app/pwa-app#asdf">PWA App</Link>
            </p>
            {children}
        </div>
    )
}
Layout.propTypes = { children: PropTypes.node }

// Save this so it can be used after browser URL changes
const originalLocation = new URL(window.location.href)

const getPluginSource = (appName, baseUrl) => {
    // if (process.env.NODE_ENV === 'development') {
    //     return 'http://localhost:3001/plugin.html'
    // }
    const absoluteBaseUrl = new URL(baseUrl, originalLocation)
    return new URL(`./api/apps/${appName}/plugin.html`, absoluteBaseUrl).href
}

const PluginLoader = () => {
    const params = useParams()
    const location = useLocation()
    const { baseUrl } = useConfig()

    const pluginSource = React.useMemo(() => {
        return getPluginSource(params.appName, baseUrl) + location.hash
    }, [params.appName, baseUrl, location.hash])

    return <Plugin width={'100%'} height={'100%'} pluginSource={pluginSource} />
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
                    <Route path="*" element={<button>Hi</button>}></Route>
                    <Route path="/app/:appName" element={<PluginLoader />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    )
}

export default MyApp
