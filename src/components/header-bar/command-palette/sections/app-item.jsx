import { colors, spacers } from '@dhis2/ui-constants'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Link } from 'react-router-dom'
import css from 'styled-jsx/css'

// Need to do this to undo <a> styles in the Link component
const { className, styles } = css.resolve`
    a {
        text-decoration: none;
    }
`

function AppItem({ name, displayName, img, highlighted }) {
    return (
        <Link
            to={`apps/${name.replace('dhis-web-', '')}`}
            className={className}
        >
            <div className={cx('item', { highlighted })} tabIndex={-1}>
                <img src={img} alt="app" className="app-icon" />
                <span className="app-name">{displayName}</span>
            </div>
            {styles}
            <style jsx>{`
                .item {
                    display: flex;
                    flex-direction: column;
                    gap: ${spacers.dp12};
                    align-items: center;
                    padding: ${spacers.dp16} ${spacers.dp4};
                    margin: 0;
                    background: ${colors.white};
                    border-radius: 1px;
                    text-decoration: none;
                    color: ${colors.grey900};
                    transition: all 0.1s ease;
                }
                .item:hover,
                .highlighted {
                    background: ${colors.grey200};
                    cursor: pointer;
                }
                .item:active {
                    background: ${colors.grey300};
                }
                .item:focus {
                    outline: none;
                }
                .item:last-of-type {
                    margin-bottom: 0;
                }
                .app-icon {
                    width: 48px;
                    height: 48px;
                }
                .app-name {
                    font-size: 13px;
                    text-align: center;
                }
            `}</style>
        </Link>
    )
}

AppItem.propTypes = {
    displayName: PropTypes.string,
    highlighted: PropTypes.bool,
    img: PropTypes.string,
    name: PropTypes.string,
}

export default AppItem
