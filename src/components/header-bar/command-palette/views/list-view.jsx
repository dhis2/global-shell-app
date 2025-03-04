import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useCommandPaletteContext } from '../context/command-palette-context.jsx'
import List from '../sections/list.jsx'
import EmptySearchResults from '../sections/search-results.jsx'

function ListView({ filteredItems, actions }) {
    const { filter, setHighlightedIndex } = useCommandPaletteContext()
    const backAction = actions?.[0]

    useEffect(() => {
        const firstItemIndexInListView = 1
        if (filter) {
            setHighlightedIndex(0)
        } else {
            setHighlightedIndex(firstItemIndexInListView)
        }
    }, [filter, setHighlightedIndex])

    return filteredItems.length > 0 ? (
        <List filteredItems={filteredItems} backAction={backAction} />
    ) : (
        filter && <EmptySearchResults />
    )
}

ListView.propTypes = {
    actions: PropTypes.array,
    filteredItems: PropTypes.array,
}

export default ListView
