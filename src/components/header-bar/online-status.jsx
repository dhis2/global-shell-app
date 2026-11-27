import {
    useDhis2ConnectionStatus,
    useOnlineStatusMessage,
} from '@dhis2/app-runtime'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import i18n from '../../locales/index.js'
import useOnlineStatusStyles from './online-status.styles.jsx'
import { onlineStatusTokens } from './online-status.tokens.js'

const { glyph } = onlineStatusTokens

/**
 * The connection to the DHIS2 server, shown in the header bar as a small
 * badge: two arrows passing each other and the word "Online" or "Offline".
 * Offline, the arrows break. An app's status message (Data Entry uses it for
 * changes saved locally that haven't reached the server yet) sits inside the
 * badge, before the glyph.
 */
export function OnlineStatus({ dense }) {
    const styles = useOnlineStatusStyles()
    const { isConnected: online } = useDhis2ConnectionStatus()
    const { onlineStatusMessage } = useOnlineStatusMessage()

    const displayStatus = online ? i18n.t('Online') : i18n.t('Offline')
    const paths = online ? glyph.paths.online : glyph.paths.offline
    const isStroke = glyph.mode !== 'fill'

    const icon = (
        <svg
            className={cx('icon', online ? 'online' : 'offline')}
            viewBox={glyph.viewBox}
            aria-hidden="true"
            focusable="false"
        >
            <g
                fill={isStroke ? 'none' : 'currentColor'}
                stroke={isStroke ? 'currentColor' : 'none'}
                strokeLinecap={glyph.strokeLinecap}
                strokeLinejoin={glyph.strokeLinejoin}
            >
                {paths.map((d) => (
                    <path key={d} d={d} />
                ))}
            </g>
        </svg>
    )

    if (dense) {
        return (
            <div
                className={cx('container', 'bar', { offline: !online })}
                data-test="headerbar-online-status"
            >
                {icon}
                <span className="label unselectable">{displayStatus}</span>
                {onlineStatusMessage && (
                    <span className="info-dense unselectable">
                        {onlineStatusMessage}
                    </span>
                )}
                <style jsx>{styles}</style>
            </div>
        )
    }

    return (
        <div className="container badge" data-test="headerbar-online-status">
            <div
                className={cx('pill', {
                    offline: !online,
                    'has-message': Boolean(onlineStatusMessage),
                })}
            >
                {onlineStatusMessage && (
                    <span className="info unselectable">
                        {onlineStatusMessage}
                    </span>
                )}
                {icon}
                <span className="label unselectable">{displayStatus}</span>
            </div>
            <style jsx>{styles}</style>
        </div>
    )
}
OnlineStatus.propTypes = {
    /** If true, displays as a sub-bar instead of a badge */
    dense: PropTypes.bool,
}
