import PropTypes from 'prop-types'
import React from 'react'
import EmptySearchResults from '../sections/empty-search-results.jsx'
import ListItem from '../sections/list-item.jsx'
import { pickHighlightRanges } from '../utils/highlighting.js'

const ListView = ({ grid, currentItem, resetModal, filter }) => {
    const listItems = grid.reduce((acc, arr) => {
        acc.push(arr[0])
        return acc
    }, [])

    return (
        <>
            {listItems.length > 0 ? (
                <div data-test="headerbar-list">
                    {listItems.map((listItem, idx) => {
                        const { item, matches } = listItem
                        const {
                            appName,
                            action,
                            displayName,
                            name,
                            icon,
                            description,
                            type,
                            dataTest,
                            path,
                        } = item
                        const isImage = typeof icon === 'string'
                        const isIcon = React.isValidElement(icon)

                        const titleKey = displayName ? 'displayName' : 'name'
                        const title = displayName || name
                        const titleMatchIndices = pickHighlightRanges({
                            textToHighlight: title,
                            matchedIndices: matches?.find(
                                (match) => match.key === titleKey
                            )?.indices,
                            query: filter,
                        })
                        const appNameMatchIndices = pickHighlightRanges({
                            textToHighlight: appName,
                            matchedIndices: matches?.find(
                                (match) => match.key === 'appName'
                            )?.indices,
                            query: filter,
                        })

                        return (
                            <ListItem
                                type={type}
                                key={`list-item-${idx}-${name}`}
                                appName={appName}
                                path={path}
                                title={title}
                                titleMatchIndices={titleMatchIndices}
                                appNameMatchIndices={appNameMatchIndices}
                                image={isImage ? icon : undefined}
                                icon={isIcon ? icon : undefined}
                                description={description}
                                highlighted={currentItem === listItem}
                                onClickHandler={action}
                                dataTest={dataTest}
                                resetModal={resetModal}
                            />
                        )
                    })}
                </div>
            ) : (
                <EmptySearchResults />
            )}
        </>
    )
}

ListView.propTypes = {
    currentItem: PropTypes.object,
    filter: PropTypes.string,
    grid: PropTypes.array,
    resetModal: PropTypes.func,
}

export default ListView
