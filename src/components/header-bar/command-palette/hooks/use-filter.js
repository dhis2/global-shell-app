import { useMemo } from 'react'
import { useCommandPaletteContext } from '../context/command-palette-context.jsx'
import {
    ALL_APPS_VIEW,
    ALL_COMMANDS_VIEW,
    ALL_SHORTCUTS_VIEW,
    FILTERABLE_ACTION,
} from '../utils/constants.js'
import { filterItemsArray } from '../utils/filterItemsArray.js'

export const useFilter = ({ apps, commands, shortcuts, actions }) => {
    const { filter, currentView } = useCommandPaletteContext()

    const searchableActions = actions.filter(
        (action) => action.type === FILTERABLE_ACTION
    )

    const filteredApps = filterItemsArray(apps, filter)
    const filteredCommands = filterItemsArray(commands, filter)
    const filteredShortcuts = filterItemsArray(shortcuts, filter)
    const filteredActions = filterItemsArray(searchableActions, filter)

    const filteredItems = useMemo(() => {
        if (currentView === ALL_APPS_VIEW) {
            return filteredApps
        } else if (currentView === ALL_COMMANDS_VIEW) {
            return filteredCommands
        } else if (currentView === ALL_SHORTCUTS_VIEW) {
            return filteredShortcuts
        } else {
            return filteredApps.concat(
                filteredCommands,
                filteredShortcuts,
                filteredActions
            )
        }
    }, [
        currentView,
        filteredApps,
        filteredCommands,
        filteredShortcuts,
        filteredActions,
    ])

    return filteredItems
}
