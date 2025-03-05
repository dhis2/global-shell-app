import { colors, spacers } from '@dhis2/ui-constants'
import PropTypes from 'prop-types'
import React from 'react'
import i18n from '../../../locales/index.js'
import { useHeaderBarContext } from '../header-bar-context.jsx'

export function UpdateNotification({ hideProfileMenu }) {
    const { updateAvailable, onApplyAvailableUpdate } = useHeaderBarContext()
    const onClick = () => {
        hideProfileMenu()
        onApplyAvailableUpdate?.()
    }

    const updateNotificationLabel = (
        <div className="root">
            <div className="badge" />
            <div className="spacer" />
            <div className="message">
                {i18n.t('App updates available — Click to reload')}
            </div>
            <style jsx>{`
                .root {
                    display: flex;
                    flex-direction: row;
                    align-items: flex-start;
                    font-size: 12px;
                    line-height: 15px;
                    color: ${colors.grey700};
                }
                .badge {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    margin: 0;
                    margin-block-start: 3px;
                    border-radius: 6px;
                    background-color: ${colors.blue600};
                    flex-shrink: 0;
                }
                .spacer {
                    display: inline-block;
                    width: 6px;
                    flex-shrink: 0;
                }
                .message {
                    display: inline-block;
                    text-align: start;
                }
            `}</style>
        </div>
    )

    return updateAvailable ? (
        <button
            onClick={onClick}
            aria-label={i18n.t('New app version available — Reload to update')}
            data-test="dhis2-ui-headerbar-updatenotification"
        >
            {updateNotificationLabel}
            <style jsx>{`
                button {
                    display: flex;
                    align-items: center;
                    background: ${colors.grey050};
                    border: none;
                    padding: ${spacers.dp8} ${spacers.dp12};
                    width: 100%;
                    cursor: pointer;
                    font-size: 12px;
                    line-height: 15px;
                    color: ${colors.grey700};
                }
                    button:hover {
                        background: ${colors.grey200};
            `}</style>
        </button>
    ) : null
}

UpdateNotification.propTypes = {
    hideProfileMenu: PropTypes.func.isRequired,
}
