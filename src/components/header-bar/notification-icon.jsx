import { colors, spacers } from '@dhis2/ui-constants'
import { IconMessages24, IconMail24 } from '@dhis2/ui-icons'
import PropTypes from 'prop-types'
import React, {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { Link } from 'react-router'
import css from 'styled-jsx/css'
import i18n from '../../locales/index.js'
import {
    DEFAULT_HEADER_BAR_BG_COLOR,
    useCustomColorContext,
} from './custom-color-context.jsx'

const BADGE_REVEAL_DURATION_MS = 3000
// The dot grows to the pill's height while the pill starts at the dot's size,
// so the two meet as one shape halfway through the morph
const DOT_SIZE = 6
const PILL_HEIGHT = 17

function icon(kind, color) {
    if (kind === 'message') {
        return <IconMessages24 color={color} />
    } else {
        return <IconMail24 color={color} />
    }
}

const DEFAULT_HOVER_BG_COLOR = '#104f7e'

const getStyles = ({ bgColor, hasCustomColor, color }) => {
    const hoverBackground = hasCustomColor
        ? ''
        : `background: ${DEFAULT_HOVER_BG_COLOR};`
    const hoverIconStyle = hasCustomColor ? 'opacity: 0.6;' : ''
    const headerColor = bgColor || DEFAULT_HEADER_BAR_BG_COLOR
    // The badge's cut-out ring matches whatever is behind it, including the
    // darker background the link gets on hover
    const hoverRingColor = hasCustomColor ? bgColor : DEFAULT_HOVER_BG_COLOR

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

        /*
         * The badge is two fixed-size layers sharing one centre point on the
         * icon's top-right corner: a dot, and the full counter pill on top of
         * it. Expanding only animates transform and opacity: the dot grows
         * and fades out while the pill grows out of it and fades in.
         *
         * Its colours are the header bar's own two, swapped, so it follows
         * custom header colours. A 2px ring in the colour behind it cuts the
         * badge out of the icon.
         */
        span {
            box-sizing: border-box;
            position: absolute;
            z-index: 1;
            /* 13.5px less half the 17px pill puts the pill on whole pixels */
            top: 13.5px;
            inset-inline-end: 11px;
            background-color: ${color};
            box-shadow: 0 0 0 2px ${headerColor};
            cursor: inherit;
            pointer-events: none;
        }
        /*
         * Transitions start only once the badge has painted. Otherwise, on
         * page load, the browser can see the badge before its transform
         * applies and slide it in from its bottom-left corner.
         */
        span.is-ready {
            transition: transform 150ms cubic-bezier(0.23, 1, 0.32, 1),
                opacity 150ms cubic-bezier(0.23, 1, 0.32, 1);
        }
        a:hover span,
        a:active span {
            box-shadow: 0 0 0 2px ${hoverRingColor};
        }

        span.dot {
            inline-size: ${DOT_SIZE}px;
            block-size: ${DOT_SIZE}px;
            border-radius: 50%;
            transform: translate(50%, -50%) scale(1);
        }

        span.pill {
            display: flex;
            justify-content: center;
            align-items: center;
            min-inline-size: 18px;
            /*
             * Roboto's digits sit 0.42px above the middle of their line. An
             * odd 17px pill and line put them on the optical centre while the
             * line and baseline stay on whole pixels, so the number doesn't
             * shift when the animation ends.
             */
            block-size: ${PILL_HEIGHT}px;
            border-radius: 9px;
            padding: 0 5px;
            color: ${headerColor};
            font-size: 11px;
            font-weight: 600;
            line-height: ${PILL_HEIGHT}px;
            font-variant-numeric: tabular-nums;
            white-space: nowrap;
            opacity: 0;
            transform: translate(50%, -50%) scale(${DOT_SIZE / PILL_HEIGHT});
        }

        /* Expanded: full counter badge */
        span.dot.is-expanded,
        a:focus-visible span.dot {
            opacity: 0;
            transform: translate(50%, -50%) scale(${PILL_HEIGHT / DOT_SIZE});
        }
        span.pill.is-expanded,
        a:focus-visible span.pill {
            opacity: 1;
            transform: translate(50%, -50%) scale(1);
        }

        /* Touch screens leave a false hover behind after a tap */
        @media (hover: hover) and (pointer: fine) {
            a:hover span.dot {
                opacity: 0;
                transform: translate(50%, -50%) scale(${PILL_HEIGHT / DOT_SIZE});
            }
            a:hover span.pill {
                opacity: 1;
                transform: translate(50%, -50%) scale(1);
            }
        }

        /* Reduced motion: keep a plain crossfade, drop the scaling */
        @media (prefers-reduced-motion: reduce) {
            span.is-ready {
                transition: opacity 150ms ease;
            }
            span.dot,
            span.dot.is-expanded,
            a:focus-visible span.dot,
            span.pill,
            span.pill.is-expanded,
            a:focus-visible span.pill {
                transform: translate(50%, -50%);
            }
        }
        @media (prefers-reduced-motion: reduce) and (hover: hover) and (pointer: fine) {
            a:hover span.dot,
            a:hover span.pill {
                transform: translate(50%, -50%);
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
    const {
        color = colors.white,
        bgColor,
        hasCustomColor,
    } = useCustomColorContext()
    const [badgeExpanded, setBadgeExpanded] = useState(count > 0)
    // Turns the badge's transitions on after its first paint
    const [ready, setReady] = useState(false)
    const hasBadge = count > 0
    useEffect(() => {
        if (!hasBadge) {
            setReady(false)
            return
        }
        let frame = requestAnimationFrame(() => {
            frame = requestAnimationFrame(() => setReady(true))
        })
        return () => cancelAnimationFrame(frame)
    }, [hasBadge])
    const label = i18n.t(ariaLabel)
    const displayCount = count > 99 ? '99+' : count
    const accessibleLabel =
        count > 0
            ? i18n.t('{{label}}, {{count}} unread', {
                  label,
                  count: displayCount,
              })
            : label

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

    // Round the pill to an even whole-pixel width. translate(50%) then lands on
    // a whole pixel, so the number doesn't shift by a fraction of a pixel when
    // the animation ends and the browser repaints the pill in place.
    const pillRef = useRef(null)
    useLayoutEffect(() => {
        const pill = pillRef.current
        if (!pill) {
            return
        }
        const fitToEvenWidth = () => {
            pill.style.inlineSize = ''
            const width = parseFloat(getComputedStyle(pill).inlineSize)
            if (width) {
                pill.style.inlineSize = `${Math.ceil(width / 2) * 2}px`
            }
        }
        fitToEvenWidth()
        // The width changes if the badge's font finishes loading later
        document.fonts?.ready.then(fitToEvenWidth)
    }, [displayCount])

    const { className, styles } = useMemo(
        () => getStyles({ bgColor, hasCustomColor, color }),
        [bgColor, hasCustomColor, color]
    )
    const expandedClass =
        (badgeExpanded ? ' is-expanded' : '') + (ready ? ' is-ready' : '')

    return (
        <Link
            dir="ltr"
            to={path}
            className={className}
            data-test={dataTestId}
            title={i18n.t(title)}
            aria-label={accessibleLabel}
        >
            {icon(kind, color)}

            {count > 0 && (
                <>
                    <span
                        className={`${className} dot${expandedClass}`}
                        aria-hidden="true"
                    />
                    <span
                        ref={pillRef}
                        className={`${className} pill${expandedClass}`}
                        data-test={`${dataTestId}-count`}
                    >
                        {displayCount}
                    </span>
                </>
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
