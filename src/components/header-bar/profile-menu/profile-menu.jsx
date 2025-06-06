import { clearSensitiveCaches, useConfig } from '@dhis2/app-runtime'
import { colors, elevations } from '@dhis2/ui-constants'
import {
    IconSettings16,
    IconMore16,
    IconLogOut16,
    IconUser16,
    IconQuestion16,
    IconLock16,
} from '@dhis2/ui-icons'
import { Center } from '@dhis2-ui/center'
import { Layer } from '@dhis2-ui/layer'
import { CircularLoader } from '@dhis2-ui/loader'
import { MenuDivider, MenuItem } from '@dhis2-ui/menu'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { Link } from 'react-router'
import i18n from '../../../locales/index.js'
import { DebugInfoMenuItem } from '../debug-info/debug-info-menu-item.jsx'
import { joinPath } from '../join-path.js'
import { linkClassName, linkStyles } from '../react-router-link-styles.jsx'
import { ProfileHeader } from './profile-header.jsx'
import { UpdateNotification } from './update-notification.jsx'

const LoadingMask = () => (
    <Layer
        translucent
        disablePortal
        dataTest="headerbar-profile-menu-loading-mask"
    >
        <Center>
            <CircularLoader />
        </Center>
    </Layer>
)

const ProfileContents = ({
    name,
    avatarId,
    helpUrl,
    hideProfileMenu,
    showDebugInfoModal,
    username,
}) => {
    const { baseUrl } = useConfig()
    const [loading, setLoading] = useState(false)

    return (
        <div>
            <ProfileHeader
                name={name}
                username={username}
                avatarId={avatarId}
            />
            <ul data-test="headerbar-profile-menu">
                <Link
                    to={'/user-profile#/settings'}
                    className={linkClassName}
                    onClick={hideProfileMenu}
                >
                    <MenuItem
                        dense
                        label={i18n.t('Settings')}
                        value="settings"
                        icon={<IconSettings16 color={colors.grey600} />}
                    />
                </Link>
                <Link
                    to={'/user-profile#/account'}
                    className={linkClassName}
                    onClick={hideProfileMenu}
                >
                    <MenuItem
                        dense
                        label={i18n.t('Account security')}
                        value="account"
                        icon={<IconLock16 color={colors.grey600} />}
                    />
                </Link>
                <Link
                    to={'/user-profile#/profile'}
                    className={linkClassName}
                    onClick={hideProfileMenu}
                >
                    <MenuItem
                        dense
                        label={i18n.t('My profile')}
                        value="profile"
                        icon={<IconUser16 color={colors.grey600} />}
                    />
                </Link>

                <MenuDivider dense />

                {helpUrl && (
                    <MenuItem
                        dense
                        href={helpUrl}
                        label={i18n.t('Help')}
                        value="help"
                        icon={<IconQuestion16 color={colors.grey600} />}
                    />
                )}
                <Link
                    to={'/user-profile#/aboutPage'}
                    className={linkClassName}
                    onClick={hideProfileMenu}
                >
                    <MenuItem
                        dense
                        label={i18n.t('System info')}
                        value="about"
                        icon={<IconMore16 color={colors.grey600} />}
                    />
                </Link>

                <MenuDivider dense />

                <MenuItem
                    dense
                    href={joinPath(
                        baseUrl,
                        'dhis-web-commons-security/logout.action'
                    )}
                    // NB: By MenuItem implementation, this callback
                    // overwrites default navigation behavior but maintains
                    // the href attribute
                    onClick={async () => {
                        setLoading(true)
                        await clearSensitiveCaches()
                        setLoading(false)
                        window.location.assign(
                            joinPath(
                                baseUrl,
                                'dhis-web-commons-security/logout.action'
                            )
                        )
                    }}
                    label={i18n.t('Log out')}
                    value="logout"
                    icon={<IconLogOut16 color={colors.grey600} />}
                />
                <DebugInfoMenuItem
                    hideProfileMenu={hideProfileMenu}
                    showDebugInfoModal={showDebugInfoModal}
                />
                <UpdateNotification hideProfileMenu={hideProfileMenu} />
            </ul>

            {loading && <LoadingMask />}

            {linkStyles}
            <style jsx>{`
                div {
                    width: 100%;
                    padding: 0;
                    background: ${colors.white};
                    box-shadow: ${elevations.e300};
                    border-radius: 3px;
                    border: 1px solid ${colors.grey300};
                    overflow: auto;
                }

                ul {
                    padding: 0;
                    margin: 0;
                }

                a,
                a:hover,
                a:focus,
                a:active,
                a:visited {
                    text-decoration: none;
                    display: block;
                }
            `}</style>
        </div>
    )
}

ProfileContents.propTypes = {
    hideProfileMenu: PropTypes.func.isRequired,
    showDebugInfoModal: PropTypes.func.isRequired,
    avatarId: PropTypes.string,
    helpUrl: PropTypes.string,
    name: PropTypes.string,
    username: PropTypes.string,
}

export const ProfileMenu = ({ ...props }) => (
    <div data-test="headerbar-profile-menu">
        <ProfileContents {...props} />
        <style jsx>{`
            div {
                z-index: 10000;
                position: absolute;
                inset-inline-end: 4px;
                width: 320px;
            }
        `}</style>
    </div>
)

ProfileMenu.propTypes = {
    hideProfileMenu: PropTypes.func.isRequired,
    showDebugInfoModal: PropTypes.func.isRequired,
    avatarId: PropTypes.string,
    helpUrl: PropTypes.string,
    name: PropTypes.string,
    username: PropTypes.string,
}
