// Fuzzy matching helpers and options
// Library: FuseJS
// Link: https://www.fusejs.io/fuzzy-search.html

export const fuseOptions = {
    includeScore: true,
    threshold: 0.3,
    ignoreDiacritics: true,
    shouldSort: true,
    keys: ['displayName', 'name', 'appName'],
    includeMatches: true,
}

export const filterItemsArray = (fuse, filter) =>
    fuse.search(filter).map(({ item, matches }) => ({ item, matches }))

export const wrapAsFuseResult = (list) =>
    list.map((item) => ({ item, matches: undefined }))
