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

    // ToDo: remove / just for testing/prototyping
    const fakeModules = {
        modules: [
            {
                name: 'dhis-web-data-quality',
                namespace: '/dhis-web-data-quality',
                defaultAction: '../dhis-web-data-quality/index.html',
                displayName: 'Calidad de Datos',
                icon: '../icons/dhis-web-data-quality.png',
                version: '1.10.34',
                shortcuts: [],
            },
            {
                name: 'dhis-web-aggregate-data-entry',
                namespace: '/dhis-web-aggregate-data-entry',
                defaultAction: '../dhis-web-aggregate-data-entry/index.html',
                displayName: 'Entrada de datos agregados',
                icon: '../icons/dhis-web-aggregate-data-entry.png',
                version: '101.0.5',
                shortcuts: [],
            },
            {
                name: 'dhis-web-messaging',
                namespace: '/dhis-web-messaging',
                defaultAction: '../dhis-web-messaging/index.html',
                displayName: 'Mensajería',
                icon: '../icons/dhis-web-messaging.png',
                version: '100.0.41',
                shortcuts: [],
            },
            {
                name: 'dhis-web-app-management',
                namespace: '/dhis-web-app-management',
                defaultAction: '../dhis-web-app-management/index.html',
                displayName: 'Administración de aplicaciones',
                icon: '../icons/dhis-web-app-management.png',
                version: '100.4.0',
                shortcuts: [
                    { name: 'Apps Home', url: '#/' },
                    { name: 'App hub', url: '#/app-hub' },
                ],
            },
            {
                name: 'dhis-web-interpretation',
                namespace: '/dhis-web-interpretation',
                defaultAction: '../dhis-web-interpretation/index.html',
                displayName: 'Interpretaciones',
                icon: '../icons/dhis-web-interpretation.png',
                version: '1.0.0',
                shortcuts: [],
            },
            {
                name: 'dhis-web-data-administration',
                namespace: '/dhis-web-data-administration',
                defaultAction: '../dhis-web-data-administration/index.html',
                displayName: 'Administracion de datos',
                icon: '../icons/dhis-web-data-administration.png',
                version: '100.0.14',
                shortcuts: [],
            },
            {
                name: 'dhis-web-event-visualizer',
                namespace: '/dhis-web-event-visualizer',
                defaultAction: '../dhis-web-event-visualizer/index.html',
                displayName: 'Visualizador de eventos',
                icon: '../icons/dhis-web-event-visualizer.png',
                version: '33.2.0',
                shortcuts: [],
            },
            {
                name: 'dhis-web-approval',
                namespace: '/dhis-web-approval',
                defaultAction: '../dhis-web-approval/index.html',
                displayName: 'Aprobación de datos',
                icon: '../icons/dhis-web-approval.png',
                version: '100.0.17',
                shortcuts: [],
            },
            {
                name: 'dhis-web-pivot',
                namespace: '/dhis-web-pivot',
                defaultAction: '../dhis-web-pivot/index.html',
                displayName: 'Tabla pivote',
                icon: '../icons/dhis-web-pivot.png',
            },
            {
                name: 'dhis-web-datastore',
                namespace: '/dhis-web-datastore',
                defaultAction: '../dhis-web-datastore/index.html',
                displayName: 'Gestión de almacenes de datos',
                icon: '../icons/dhis-web-datastore.png',
                version: '1.3.5',
                shortcuts: [],
            },
            {
                name: 'dhis-web-maps',
                namespace: '/dhis-web-maps',
                defaultAction: '../dhis-web-maps/index.html',
                displayName: 'Mapas',
                icon: '../icons/dhis-web-maps.png',
                version: '101.2.2',
                shortcuts: [],
            },
            {
                name: 'dhis-web-data-visualizer',
                namespace: '/dhis-web-data-visualizer',
                defaultAction: '../dhis-web-data-visualizer/index.html',
                displayName: 'Visualizador de Datos',
                icon: '../icons/dhis-web-data-visualizer.png',
                version: '101.0.6',
                shortcuts: [],
            },
            {
                name: 'dhis-web-reports',
                namespace: '/dhis-web-reports',
                defaultAction: '../dhis-web-reports/index.html',
                displayName: 'Informes',
                icon: '../icons/dhis-web-reports.png',
                version: '100.0.64',
                shortcuts: [],
            },
            {
                name: 'dhis-web-maintenance',
                namespace: '/dhis-web-maintenance',
                defaultAction: '../dhis-web-maintenance/index.html',
                displayName: 'Mantenimiento',
                icon: '../icons/dhis-web-maintenance.png',
                version: '32.33.11',
                shortcuts: [],
            },
            {
                name: 'dhis-web-dashboard',
                namespace: '/dhis-web-dashboard',
                defaultAction: '../dhis-web-dashboard/index.html',
                displayName: 'Tablero',
                icon: '../icons/dhis-web-dashboard.png',
                version: '101.1.1',
                shortcuts: [],
            },
            {
                name: 'dhis-web-translations',
                namespace: '/dhis-web-translations',
                defaultAction: '../dhis-web-translations/index.html',
                displayName: 'Traducciones',
                icon: '../icons/dhis-web-translations.png',
                version: '100.0.6',
                shortcuts: [],
            },
            {
                name: 'dhis-web-capture',
                namespace: '/dhis-web-capture',
                defaultAction: '../dhis-web-capture/index.html',
                displayName: 'Capturar',
                icon: '../icons/dhis-web-capture.png',
                version: '101.32.1',
                shortcuts: [],
            },
            {
                name: 'dhis-web-usage-analytics',
                namespace: '/dhis-web-usage-analytics',
                defaultAction: '../dhis-web-usage-analytics/index.html',
                displayName: 'Analítica de Uso',
                icon: '../icons/dhis-web-usage-analytics.png',
                version: '101.1.0',
                shortcuts: [],
            },
            {
                name: 'dhis-web-login',
                namespace: '/dhis-web-login',
                defaultAction: '../dhis-web-login/index.html',
                displayName: 'Iniciar sesión',
                icon: '../icons/dhis-web-login.png',
                version: '100.4.3',
                shortcuts: [],
            },
            {
                name: 'dhis-web-cache-cleaner',
                namespace: '/dhis-web-cache-cleaner',
                defaultAction: '../dhis-web-cache-cleaner/index.html',
                displayName: 'Limpiador de caché',
                icon: '../icons/dhis-web-cache-cleaner.png',
                version: '100.1.18',
                shortcuts: [],
            },
            {
                name: 'dhis-web-menu-management',
                namespace: '/dhis-web-menu-management',
                defaultAction: '../dhis-web-menu-management/index.html',
                displayName: 'Gestión de menús',
                icon: '../icons/dhis-web-menu-management.png',
                version: '100.1.0',
                shortcuts: [],
            },
            {
                name: 'dhis-web-event-reports',
                namespace: '/dhis-web-event-reports',
                defaultAction: '../dhis-web-event-reports/index.html',
                displayName: 'Informes de eventos',
                icon: '../icons/dhis-web-event-reports.png',
                version: '33.3.0',
                shortcuts: [],
            },
            {
                name: 'dhis-web-scheduler',
                namespace: '/dhis-web-scheduler',
                defaultAction: '../dhis-web-scheduler/index.html',
                displayName: 'Planificador',
                icon: '../icons/dhis-web-scheduler.png',
                version: '101.6.18',
                shortcuts: [],
            },
            {
                name: 'dhis-web-user-profile',
                namespace: '/dhis-web-user-profile',
                defaultAction: '../dhis-web-user-profile/index.html',
                displayName: 'dhis-web-user-profile',
                icon: '../icons/dhis-web-user-profile.png',
                version: '100.7.2',
                shortcuts: [],
            },
            {
                name: 'dhis-web-settings',
                namespace: '/dhis-web-settings',
                defaultAction: '../dhis-web-settings/index.html',
                displayName: 'System Settings',
                icon: '../icons/dhis-web-settings.png',
                version: '100.5.0',
                shortcuts: [],
            },
            {
                name: 'dhis-web-import-export',
                namespace: '/dhis-web-import-export',
                defaultAction: '../dhis-web-import-export/index.html',
                displayName: 'Importar/exportar',
                icon: '../icons/dhis-web-import-export.png',
                version: '101.1.28',
                shortcuts: [],
            },
            {
                name: 'dhis-web-user',
                namespace: '/dhis-web-user',
                defaultAction: '../dhis-web-user/index.html',
                displayName: 'Usuarios',
                icon: '../icons/dhis-web-user.png',
                version: '100.7.1',
                shortcuts: [],
            },
            {
                name: 'dhis-web-sms-configuration',
                namespace: '/dhis-web-sms-configuration',
                defaultAction: '../dhis-web-sms-configuration/index.html',
                displayName: 'Configuración SMS',
                icon: '../icons/dhis-web-sms-configuration.png',
                version: '100.0.58',
                shortcuts: [],
            },
        ],
    }

    // fetch shortcuts
    const shortcuts = useMemo(() => {
        if (!data?.apps?.modules) {
            return []
        }

        // return data.apps.
        return fakeModules.modules?.reduce((acc, currModule) => {
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
    }, [data, fakeModules, getPath])

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
