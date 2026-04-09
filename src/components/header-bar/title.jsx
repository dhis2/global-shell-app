import PropTypes from 'prop-types'
import React from 'react'
import { useCustomColorContext } from './custom-color-context.jsx'

export const Title = ({ app, instance }) => {
    const { hasCustomColor, color } = useCustomColorContext()
    const shadowColor = color === 'black' ? 'white' : 'black'
    const shadow = hasCustomColor
        ? `text-shadow: 0px 0px 2px ${shadowColor};`
        : 'text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.5);'
    return (
        <div data-test="headerbar-title">
            {app ? `${instance} - ${app}` : `${instance}`}

            <style jsx>{`
                div {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-size: 13px;
                    letter-spacing: 0.01em;
                    ${shadow}
                    white-space: nowrap;
                }
            `}</style>
        </div>
    )
}
Title.propTypes = {
    app: PropTypes.string,
    instance: PropTypes.string,
}
