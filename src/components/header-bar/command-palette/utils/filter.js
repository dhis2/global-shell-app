import Fuse from 'fuse.js';
import {
    ALL_APPS_VIEW,
    ALL_COMMANDS_VIEW,
    ALL_SHORTCUTS_VIEW,
    FILTERABLE_ACTION,
} from './constants.js'

function removePunctuationMarks(text) {
    return text.replace(/[.,!;:`"'?\-_\s]/g, '')
}

function removeAccentMarks(str) {
    /**
     * normalisation reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
     */
    return str.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
}

export function processString(text) {
    const str = removePunctuationMarks(text)
    return removeAccentMarks(str)
}

export const filterItemsArray = (items, filter) => {
    if (!items?.length) return []

    const fuse = new Fuse(items, {
        includeScore: true,
        threshold: 0.5,
        ignoreLocation: true,
        ignoreDiacritics: true,
        shouldSort: true,
        keys: ['displayName', 'name'],
    });

    const normalised = processString(filter)

    return filter ? fuse?.search(normalised)?.map(result => result.item) : items
}

export const filterItemsPerView = ({
    apps,
    commands,
    shortcuts,
    actions,
    filter,
    currentView,
}) => {
    const searchableActions = actions.filter(
        (action) => action.type === FILTERABLE_ACTION
    )

    const filteredApps = filterItemsArray(apps, filter)
    const filteredCommands = filterItemsArray(commands, filter)
    const filteredShortcuts = filterItemsArray(shortcuts, filter)
    const filteredActions = filterItemsArray(searchableActions, filter)

    if (currentView === ALL_APPS_VIEW) {
        return filteredApps
    }
    if (currentView === ALL_COMMANDS_VIEW) {
        return filteredCommands
    }
    if (currentView === ALL_SHORTCUTS_VIEW) {
        return filteredShortcuts
    }

    return [
        ...filteredApps,
        ...filteredCommands,
        ...filteredShortcuts,
        ...filteredActions,
    ]
}
