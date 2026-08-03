import { colors, elevations, spacers, theme } from '@dhis2/ui-constants'
import { IconMessages24, IconMail24 } from '@dhis2/ui-icons'
import PropTypes from 'prop-types'
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import css from 'styled-jsx/css'
import i18n from '../../locales/index.js'
import {
    DEFAULT_HEADER_BAR_BG_COLOR,
    useCustomColorContext,
} from './custom-color-context.jsx'

const BADGE_REVEAL_DURATION_MS = 3000

function icon(kind, color) {
    if (kind === 'message') {
        return <IconMessages24 color={color} />
    } else {
        return <IconMail24 color={color} />
    }
}

const getStyles = ({ bgColor, color }) => {
    const hoverBackground = bgColor ? '' : 'background: #104f7e;'
    const hoverIconStyle = bgColor ? 'opacity: 0.6;' : ''
    const ringColor = bgColor || DEFAULT_HEADER_BAR_BG_COLOR

    return css.resolve`
        a {
            /* Need this to undo <a> styles in Link component: */
            text-decoration: none;
            /* Rest of styles: */
            position: relative;
            margin: 0;
            cursor: pointer;
            padding: 0 ${spacers.dp8};
            height: 100%;
            display: flex;
            align-items: center;
        }
        a:focus {
            outline: 2px solid white;
            outline-offset: -2px;
        }
        a:focus:not(:focus-visible) {
            outline: none;
        }
        a:hover,
        a:active {
            ${hoverBackground}
        }
        a:hover :global(svg),
        a:active :global(svg) {
            ${hoverIconStyle}
        }

        span {
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1;
            position: absolute;
            /* Anchored on a fixed centre point over the icon's top corner */
            top: 14px;
            inset-inline-end: ${spacers.dp12};
            transform: translate(50%, -50%);
            background-color: ${theme.secondary200};
            border: 1px solid ${color};
            font-size: 13px;
            font-weight: 600;
            line-height: 15px;
            text-align: center;
            cursor: inherit;
            white-space: nowrap;
            overflow: hidden;

            /* Dot state (default) */
            min-inline-size: ${spacers.dp8};
            max-inline-size: ${spacers.dp8};
            min-block-size: ${spacers.dp8};
            max-block-size: ${spacers.dp8};
            border-radius: ${spacers.dp4};
            padding: 0;
            color: transparent;
            box-shadow: 0 0 0 2px ${ringColor};

            transition: all 150ms ease-in-out;
        }

        /* Full counter badge */
        span.is-expanded,
        a:hover span,
        a:focus-visible span {
            min-inline-size: 18px;
            max-inline-size: 80px;
            min-block-size: 18px;
            max-block-size: 18px;
            border-radius: ${spacers.dp12};
            padding: 0 ${spacers.dp4};
            color: ${theme.secondary800};
            box-shadow: ${elevations.e100};
        }

        @media (prefers-reduced-motion: reduce) {
            span {
                transition: none;
            }
        }
    `
}

export const NotificationIcon = ({
    count = 0,
    path,
    kind,
    dataTestId,
    title,
    'aria-label': ariaLabel,
}) => {
    const { color = colors.white, bgColor } = useCustomColorContext()
    const [badgeExpanded, setBadgeExpanded] = useState(count > 0)

    // Briefly reveal the full counter whenever a count arrives or changes, then
    // collapse it back to a dot
    useEffect(() => {
        if (count === 0) {
            setBadgeExpanded(false)
            return
        }
        setBadgeExpanded(true)
        const timer = setTimeout(
            () => setBadgeExpanded(false),
            BADGE_REVEAL_DURATION_MS
        )
        return () => clearTimeout(timer)
    }, [count])

    const { className, styles } = useMemo(
        () => getStyles({ bgColor, color }),
        [bgColor, color]
    )

    return (
        <Link
            dir="ltr"
            to={path}
            className={className}
            data-test={dataTestId}
            title={i18n.t(title)}
            aria-label={i18n.t(ariaLabel)}
        >
            {icon(kind, color)}

            {count > 0 && (
                <span
                    className={
                        badgeExpanded ? `${className} is-expanded` : className
                    }
                    data-test={`${dataTestId}-count`}
                >
                    {count > 99 ? '99+' : count}
                </span>
            )}

            {styles}
        </Link>
    )
}
NotificationIcon.propTypes = {
    'aria-label': PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    count: PropTypes.number,
    dataTestId: PropTypes.string,
    kind: PropTypes.oneOf(['interpretation', 'message']),
}
