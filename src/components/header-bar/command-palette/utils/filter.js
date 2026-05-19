import {
    ALL_APPS_VIEW,
    ALL_COMMANDS_VIEW,
    ALL_SHORTCUTS_VIEW,
    APP,
    COMMAND,
    FILTERABLE_ACTION,
    SHORTCUT,
} from './constants.js'
import { filterItemsArray, wrapAsFuseResult } from './fuzzy-matching.js'

const groupAppsWithShortcuts = ({
    filteredApps,
    filteredShortcuts,
    shortcuts,
}) => {

    // Group each app with its shortcuts
    const shortcutsByApp = new Map()
    for (const shortcut of shortcuts) {
        if (!shortcutsByApp.has(shortcut.appName)) {
            shortcutsByApp.set(shortcut.appName, [])
        }
        shortcutsByApp.get(shortcut.appName).push(shortcut)
    }
    
    const matchesByShortcut = new Map(
        // retain all the fuse matches for each filtered shortcut
        filteredShortcuts.map(({ item, matches }) => [item, matches])
    )

    // For all matched apps, return them with their shortcuts and their matches
    const appsWithShortcuts = filteredApps.flatMap(({ item, matches }) => {
        const appShortcuts = shortcutsByApp.get(item.displayName) ?? []
        
        const appShortcutResults = appShortcuts.map((shortcut) => ({
            item: shortcut,
            matches: matchesByShortcut.get(shortcut),
        }))
        return [{ item, matches }, ...appShortcutResults]
    })

    const matchedAppNames = new Set(
        filteredApps.map(({ item }) => item.displayName || item.name)
    )

    // Filter for remaining shortcuts that matched the filter without their parent app
    const remainingShortcuts = filteredShortcuts.filter(
        ({ item }) => !matchedAppNames.has(item.appName)
    )

    return { appsWithShortcuts, remainingShortcuts }
}

export const filterItemsPerView = ({
    appsFuse,
    commandsFuse,
    shortcutsFuse,
    allItemsFuse,
    apps,
    commands,
    shortcuts,
    actions,
    filter,
    currentView,
}) => {
    if (!filter) {
        if (currentView === ALL_APPS_VIEW) {
            return wrapAsFuseResult([...apps])
        }
        if (currentView === ALL_COMMANDS_VIEW) {
            return wrapAsFuseResult([...commands])
        }
        if (currentView === ALL_SHORTCUTS_VIEW) {
            return wrapAsFuseResult([...shortcuts])
        }

        return [
            ...wrapAsFuseResult(apps),
            ...wrapAsFuseResult(commands),
            ...wrapAsFuseResult(shortcuts),
            ...wrapAsFuseResult(actions),
        ]
    }

    // If there is a filter
    if (currentView === ALL_APPS_VIEW) {
        return filterItemsArray(appsFuse, filter)
    }
    if (currentView === ALL_COMMANDS_VIEW) {
        return filterItemsArray(commandsFuse, filter)
    }
    if (currentView === ALL_SHORTCUTS_VIEW) {
        return filterItemsArray(shortcutsFuse, filter)
    }

    const filteredItems = filterItemsArray(allItemsFuse, filter)

    const filteredApps = filteredItems.filter(({ item }) => item.type === APP)
    const filteredShortcuts = filteredItems.filter(
        ({ item }) => item.type === SHORTCUT
    )
    const filteredCommands = filteredItems.filter(
        ({ item }) => item.type === COMMAND
    )
    const filteredActions = filteredItems.filter(
        ({ item }) => item.type === FILTERABLE_ACTION
    )

    const { appsWithShortcuts, remainingShortcuts } = groupAppsWithShortcuts({
        filteredApps,
        filteredShortcuts,
        shortcuts,
    })

    return [
        ...appsWithShortcuts,
        ...remainingShortcuts,
        ...filteredCommands,
        ...filteredActions,
    ]
}
