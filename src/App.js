import { useConfig } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React from 'react'
import {
    BrowserRouter,
    Routes,
    Route,
    Link,
} from 'react-router-dom'
import styles from './App.module.css'
import { ConnectedHeaderBar } from './components/ConnectedHeaderbar.js'
import { PluginLoader } from './components/PluginLoader.js'

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

// todo: also listen to navigations inside iframe (e.g. "Open this dashboard item in DV" links)
// (Could the `window` prop on BrowserRouter help here?)
const MyApp = () => {
    const { baseUrl } = useConfig()
    // todo: maybe pare this down to just onApplyUpdate?
    // todo: reset upon switching to a new client app
    const [clientPWAUpdateAvailable, setClientPWAUpdateAvailable] =
        React.useState(false)
    const [onApplyClientUpdate, setOnApplyClientUpdate] = React.useState()

    // todo: work on this to get the right URL when landing on an app URL
    const basename = React.useMemo(() => {
        if (process.env.NODE_ENV === 'development') {
            return // undefined is okay
        }
        return new URL(`./api/apps/global-shell/`, baseUrl).pathname
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
