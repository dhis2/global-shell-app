import PropTypes from 'prop-types'
import React from 'react'
import EmptySearchResults from '../sections/empty-search-results.jsx'
import ListItem from '../sections/list-item.jsx'

const ListView = ({ grid, currentItem }) => {
    const listItems = grid.reduce((acc, arr) => {
        acc.push(arr[0])
        return acc
    }, [])

    return (
        <>
            {listItems.length > 0 ? (
                <div data-test="headerbar-list">
                    {listItems.map((item, idx) => {
                        const {
                            action,
                            displayName,
                            name,
                            icon,
                            description,
                            type,
                            dataTest,
                        } = item
                        const isImage = typeof icon === 'string'
                        const isIcon = React.isValidElement(icon)

                        return (
                            <ListItem
                                type={type}
                                key={`app-${name}-${idx}`}
                                name={name}
                                title={displayName || name}
                                image={isImage ? icon : undefined}
                                icon={isIcon ? icon : undefined}
                                description={description}
                                highlighted={currentItem === item}
                                onClickHandler={action}
                                dataTest={dataTest}
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
    grid: PropTypes.array,
}

export default ListView
