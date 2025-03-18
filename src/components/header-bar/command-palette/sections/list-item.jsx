import { IconChevronRight16 } from '@dhis2/ui'
import { colors, spacers } from '@dhis2/ui-constants'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Link } from 'react-router'
import { linkClassName, linkStyles } from '../../react-router-link-styles.jsx'
import { COMMAND, APP, SHORTCUT } from '../utils/constants.js'

function ListItem({
    title,
    name,
    icon,
    image,
    description,
    type,
    onClickHandler,
    highlighted,
    resetModal,
    appName,
    dataTest = 'headerbar-list-item',
}) {
    const showDescription = type === COMMAND
    // todo: extend this to support shortcut links as well
    const isApp = type === APP
    const isShortcut = type === SHORTCUT

    const item = (
        <div
            onClick={isApp ? undefined : onClickHandler}
            className={cx('item', { highlighted })}
            data-test={dataTest}
            role={isApp ? undefined : 'button'}
            tabIndex={-1}
        >
            <div
                className={cx('icon', {
                    'icon-shortcut': isShortcut,
                })}
            >
                {icon && <span className="icon-content">{icon}</span>}
                {image && (
                    <img className="icon-content" src={image} alt="img" />
                )}
            </div>
            <div className="text-content">
                <span className="title">
                    {isShortcut && (
                        <>
                            <span className="shortcut-app-name">
                                {appName}

                                <IconChevronRight16 />
                            </span>
                        </>
                    )}
                    {title}
                </span>
                {showDescription && (
                    <span className="description">{description}</span>
                )}
            </div>
            <style jsx>
                {`
                    .item {
                        display: flex;
                        align-items: center;
                        padding: ${spacers.dp8};
                        margin: 0 ${spacers.dp4};
                        background: ${colors.white};
                        border-left: 4px solid transparent;
                        border-radius: 1px;
                        text-decoration: none;
                        color: ${colors.grey900};
                        transition: all 0.1s ease;
                    }
                    .item:last-of-type {
                        margin-bottom: ${spacers.dp4};
                    }
                    .item:hover,
                    .highlighted {
                        background: ${colors.grey200};
                        cursor: pointer;
                        outline: none;
                    }
                    .item:active {
                        background: ${colors.grey300};
                    }
                    .icon {
                        width: 20px;
                        height: 20px;
                        position: relative;
                        margin-right: ${spacers.dp8};
                    }
                    .icon-content {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .text-content {
                        display: flex;
                        flex-direction: column;
                        align-items: baseline;
                        width: 100%;
                        gap: ${spacers.dp8};
                        padding-top: 2px;
                    }
                    .description {
                        font-size: 14px;
                        color: ${colors.grey600};
                    }
                    .title {
                        font-size: 14px;
                        margin-right: ${spacers.dp4};
                    }
                    .shortcut-app-name {
                        color: ${colors.grey600};
                        display: inline-flex;
                        line-height: 16px;
                        align-items: center;
                    }
                `}
            </style>
        </div>
    )

    if (isApp) {
        // Use react-router client-side routing to apps:
        return (
            <Link
                to={`/${name?.replace('dhis-web-', '')}`}
                className={linkClassName}
                // ...and then close the palette
                onClick={resetModal}
            >
                {item}
                {linkStyles}
            </Link>
        )
    }

    return item
}

ListItem.propTypes = {
    appName: PropTypes.string,
    dataTest: PropTypes.string,
    description: PropTypes.string,
    highlighted: PropTypes.bool,
    icon: PropTypes.node,
    image: PropTypes.string,
    name: PropTypes.string,
    resetModal: PropTypes.func,
    title: PropTypes.string,
    type: PropTypes.string,
    onClickHandler: PropTypes.func,
}

export default ListItem
