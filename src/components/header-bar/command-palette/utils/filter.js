import Fuse from 'fuse.js'
import {
    ALL_APPS_VIEW,
    ALL_COMMANDS_VIEW,
    ALL_SHORTCUTS_VIEW,
    FILTERABLE_ACTION,
} from './constants.js'

export const filterItemsArray = (items, filter) => {
    if (!items?.length) {
        return []
    }

    const fuse = new Fuse(items, {
        includeScore: true,
        threshold: 0.4,
        // ignoreLocation: true,
        ignoreDiacritics: true,
        shouldSort: true,
        keys: ['displayName', 'name'],
    })

    return filter ? fuse.search(filter).map((result) => result.item) : items
}

export const filterItemsPerView = ({
    apps,
    commands,
    shortcuts,
    actions,
    filter,
    currentView,
}) => {
    if (currentView === ALL_APPS_VIEW) {
        return filterItemsArray(apps, filter)
    }
    if (currentView === ALL_COMMANDS_VIEW) {
        return filterItemsArray(commands, filter)
    }
    if (currentView === ALL_SHORTCUTS_VIEW) {
        return filterItemsArray(shortcuts, filter)
    }

    const searchableActions = actions.filter(
        (action) => action.type === FILTERABLE_ACTION
    )

    const filteredApps = filterItemsArray(apps, filter)
    const filteredCommands = filterItemsArray(commands, filter)
    const filteredShortcuts = filterItemsArray(shortcuts, filter)
    const filteredActions = filterItemsArray(searchableActions, filter)

    // Group app with its shortcuts
    // Filter for matched apps and return them with their shortcuts
    // Append remaining shortcuts that match
    const shortcutsByApp = new Map()
    for (const shortcut of shortcuts) {
        if (!shortcutsByApp.has(shortcut.appName)) {
            shortcutsByApp.set(shortcut.appName, [])
        }
        shortcutsByApp.get(shortcut.appName).push(shortcut)
    }

    const filteredAppsWithShortcuts = filteredApps.flatMap((app) => [
        app,
        ...(shortcutsByApp.get(app.displayName) ?? []),
    ])

    const matchedAppNames = new Set(
        filteredApps.map((app) => app.displayName || app.name)
    )

    const remainingShortcuts = filteredShortcuts.filter(
        (shortcut) => !matchedAppNames.has(shortcut.appName)
    )

    return [
        ...filteredAppsWithShortcuts,
        ...filteredCommands,
        ...remainingShortcuts,
        ...filteredActions,
    ]
}
