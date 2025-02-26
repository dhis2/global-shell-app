import { useConfig, useDataQuery } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React from 'react'
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom'
import styles from './App.module.css'
import { ConnectedHeaderBar } from './components/ConnectedHeaderbar.jsx'
import { PluginLoader } from './components/PluginLoader.jsx'
import { ClientPWAProvider } from './lib/clientPWAUpdateState.jsx'

const APPS_INFO_QUERY = {
    appMenu: {
        resource: 'apps/menu',
    },
    apps: {
        resource: 'apps',
    },
    // todo:
    // want to get versions of installed apps, i.e. /dhis-web-apps/apps-bundle.json
    // need to extend app-runtime to get that
}

const Layout = ({ appsInfoQuery }) => {
    return (
        <div className={styles.container}>
            <ConnectedHeaderBar appsInfoQuery={appsInfoQuery} />
            <Outlet />
        </div>
    )
}
Layout.propTypes = { appsInfoQuery: PropTypes.object }

const MyApp = () => {
    const { baseUrl } = useConfig()
    const appsInfoQuery = useDataQuery(APPS_INFO_QUERY)

    // todo: work on this to get the right URL when landing on an app URL
    const basename = React.useMemo(() => {
        if (process.env.NODE_ENV === 'development') {
            return // undefined is okay
        }
        return new URL(baseUrl).pathname
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // todo: would be nice to get appInfo here, but useParams().appName is only available inside routes
    // (see getAppDisplayName in ConnectedHeaderBar.jsx and getAppDefaultAction in PluginLoader.jsx)

    return (
        <ClientPWAProvider>
            <BrowserRouter basename={basename}>
                <Routes>
                    <Route element={<Layout appsInfoQuery={appsInfoQuery} />}>
                        <Route
                            // todo: remove when done testing
                            path="*"
                            element={<Link to="/apps/localApp">Local App</Link>}
                        />
                        <Route
                            path="/apps/:appName"
                            element={
                                <PluginLoader appsInfoQuery={appsInfoQuery} />
                            }
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ClientPWAProvider>
    )
}

export default MyApp
