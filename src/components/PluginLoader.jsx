import { useConfig } from '@dhis2/app-runtime'
// eslint-disable-next-line import/no-unresolved
import { Plugin } from '@dhis2/app-runtime/experimental'
import PropTypes from 'prop-types'
import React from 'react'
import { useLocation, useParams } from 'react-router-dom'

// Doesn't work on maintenance app
// Doesn't work cross-domain
const injectHeaderbarHidingStyles = (event) => {
    try {
        const iframe = event?.target || document.querySelector('iframe')
        const doc = iframe.contentDocument
        const styleElement = doc.createElement('style')
        styleElement.textContent =
            'div.app-shell-adapter header { display: none; }'
        doc.head.appendChild(styleElement)
    } catch (err) {
        console.error(
            'Failed to apply styles to the client app to hide its header bar. ' +
                'This could be due to the client app being hosted on a different domain.',
            err
        )
    }
}

// todo: this is kinda duplicated between here and the header bar
const getAppDefaultAction = (appName, modules) => {
    // todo: check this out if core apps get a different naming scheme
    return modules.find(
        (m) => m.name === appName || m.name === 'dhis-web-' + appName
    )?.defaultAction
}

// todo: why is there a request to /apps/undefined?redirect=false
const newGetPluginSource = async (appName, modules, baseUrl) => {
    const defaultAction = getAppDefaultAction(appName, modules)
    const defaultAppUrl = new URL(defaultAction, baseUrl)
    const pluginifiedAppUrl = new URL('./app.html', defaultAppUrl)

    // Start by trying to load pluginified app
    const pluginifiedAppResponse = await fetch(pluginifiedAppUrl)
    if (pluginifiedAppResponse.ok) {
        return pluginifiedAppUrl.href
    }
    // If pluginified app is not found, fall back to app root
    return defaultAction
}

// todo: update page title (html head) with new app

export const PluginLoader = ({
    setClientPWAUpdateAvailable,
    setOnApplyClientUpdate,
    appsInfoQuery,
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
        if (!appsInfoQuery.data) {
            return
        }
        const asyncWork = async () => {
            // for testing: params.appName === 'localApp' ? 'http://localhost:3001/app.html'
            const newPluginSource = await newGetPluginSource(
                params.appName,
                appsInfoQuery.data.appMenu.modules,
                baseUrl
            )
            setPluginSource(newPluginSource)
        }
        asyncWork()
    }, [params.appName, baseUrl, appsInfoQuery.data])

    if (!pluginSource) {
        return 'Loading...' // todo
    }

    return (
        <Plugin
            width={'100%'}
            height={'100%'}
            // todo: only for apps without header bars
            // height={'calc(100% - 48px)'}
            // pass URL hash down to the client app
            pluginSource={pluginSource + '?redirect=false' + location.hash}
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
    appsInfoQuery: PropTypes.object,
    setClientPWAUpdateAvailable: PropTypes.func,
    setOnApplyClientUpdate: PropTypes.func,
}
