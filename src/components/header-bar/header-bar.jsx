import { useDataQuery, useConfig } from '@dhis2/app-runtime'
import { colors } from '@dhis2/ui-constants'
import PropTypes from 'prop-types'
import React, { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import i18n from '../../locales/index.js'
import CommandPalette from './command-palette/command-palette.jsx'
import { CommandPaletteContextProvider } from './command-palette/context/command-palette-context.jsx'
import { APP, SHORTCUT } from './command-palette/utils/constants.js'
import { HeaderBarContextProvider } from './header-bar-context.jsx'
import { joinPath } from './join-path.js'
import { Logo } from './logo.jsx'
import { Notifications } from './notifications.jsx'
import { OnlineStatus } from './online-status.jsx'
import Profile from './profile.jsx'
import { Title } from './title.jsx'

const query = {
    title: {
        resource: 'systemSettings/applicationTitle',
    },
    help: {
        resource: 'systemSettings/helpPageLink',
    },
    user: {
        resource: 'me',
        params: {
            fields: ['authorities', 'avatar', 'name', 'settings', 'username'],
        },
    },
    apps: {
        resource: 'action::menu/getModules',
    },
    notifications: {
        resource: 'me/dashboard',
    },
}

export const HeaderBar = ({
    appName,
    appVersion,
    className,
    updateAvailable,
    onApplyAvailableUpdate,
}) => {
    const { appName: configAppName, baseUrl, pwaEnabled } = useConfig()
    const { loading, error, data } = useDataQuery(query)
    const navigate = useNavigate()

    const getPath = useCallback(
        (path) =>
            path.startsWith('http:') || path.startsWith('https:')
                ? path
                : joinPath(baseUrl, 'api', path),
        [baseUrl]
    )

    const apps = useMemo(() => {
        return data?.apps.modules.map((app) => ({
            ...app,
            type: APP,
            icon: getPath(app.icon),
            action: () => {
                navigate(`/${app.name.replace('dhis-web-', '')}`)
            },
        }))
    }, [data, baseUrl, navigate])

    // fetch commands
    const commands = []

    // fetch shortcuts
    const shortcuts = useMemo(() => {
        if (!data?.apps?.modules) {
            return []
        }

        return data.apps.modules?.reduce((acc, currModule) => {
            const { defaultAction, icon, displayName: appName } = currModule
            const shortcuts =
                currModule.shortcuts?.map(({ name, displayName, url }) => {
                    const shortcutDefaultAction = getPath(defaultAction) + url
                    return {
                        type: SHORTCUT,
                        name: displayName ?? name,
                        appName,
                        // ToDo: confirm what the default action should be in Global shell
                        // ToDo: check why dhis-web-pivot doesn't have manifest
                        defaultAction: shortcutDefaultAction,
                        icon: getPath(icon),
                        action: () => {
                            window.location.href = shortcutDefaultAction
                        },
                    }
                }) ?? []

            return [...acc, ...shortcuts]
        }, [])
    }, [data, getPath])

    // See https://jira.dhis2.org/browse/LIBS-180
    if (!loading && !error) {
        // TODO: This will run every render which is probably wrong!
        // Also, setting the global locale shouldn't be done in the headerbar
        const locale = data.user.settings.keyUiLocale || 'en'
        i18n.setDefaultNamespace('default')
        i18n.changeLanguage(locale)
    }

    return (
        <HeaderBarContextProvider
            updateAvailable={updateAvailable}
            onApplyAvailableUpdate={onApplyAvailableUpdate}
            clientAppName={appName}
            clientAppVersion={appVersion}
        >
            <header className={className}>
                <div className="main">
                    {!loading && !error && (
                        <>
                            <Logo />

                            <Title
                                app={appName || configAppName}
                                instance={data.title.applicationTitle}
                            />

                            <div className="right-control-spacer" />

                            {pwaEnabled && <OnlineStatus />}

                            <Notifications
                                interpretations={
                                    data.notifications.unreadInterpretations
                                }
                                messages={
                                    data.notifications
                                        .unreadMessageConversations
                                }
                                userAuthorities={data.user.authorities}
                            />
                            <CommandPaletteContextProvider>
                                <CommandPalette
                                    apps={apps}
                                    commands={commands}
                                    shortcuts={shortcuts}
                                />
                            </CommandPaletteContextProvider>
                            <Profile
                                name={data.user.name}
                                username={data.user.username}
                                avatarId={data.user.avatar?.id}
                                helpUrl={data.help.helpPageLink}
                            />
                        </>
                    )}
                </div>

                {pwaEnabled && !loading && !error && <OnlineStatus dense />}

                <style jsx>{`
                    .main {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                        background-color: #165c92;
                        color: ${colors.white};
                        height: 40px;
                    }
                    .right-control-spacer {
                        margin-inline-start: auto;
                    }
                `}</style>
            </header>
        </HeaderBarContextProvider>
    )
}

HeaderBar.propTypes = {
    appName: PropTypes.string,
    appVersion: PropTypes.string,
    className: PropTypes.string,
    updateAvailable: PropTypes.bool,
    onApplyAvailableUpdate: PropTypes.func,
}
