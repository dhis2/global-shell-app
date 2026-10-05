import PropTypes from 'prop-types'
import React, { createContext, useContext, useMemo } from 'react'

export const DEFAULT_HEADER_BAR_BG_COLOR = '#165c92'

const customColorContext = createContext({})

export const CustomColorProvider = ({ color, bgColor, children }) => {
    const contextValue = useMemo(
        () => ({
            color,
            bgColor,
            hasCustomColor: bgColor !== DEFAULT_HEADER_BAR_BG_COLOR,
        }),
        [color, bgColor]
    )
    return (
        <customColorContext.Provider value={contextValue}>
            {children}
        </customColorContext.Provider>
    )
}
CustomColorProvider.propTypes = {
    bgColor: PropTypes.string,
    children: PropTypes.node,
    color: PropTypes.string,
}

export const useCustomColorContext = () => useContext(customColorContext)
