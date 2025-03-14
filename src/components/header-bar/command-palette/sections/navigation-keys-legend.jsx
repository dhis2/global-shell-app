import { colors, spacers } from '@dhis2/ui-constants'
import React from 'react'
import i18n from '../../../../locales/index.js'
import { useCommandPaletteContext } from '../context/command-palette-context.jsx'
import {
    BackNavigationIcon,
    CloseKeyIcon,
    MultiDirectionNavigationIcon,
    SelectKeyIcon,
    VerticalNavigationIcon,
} from '../icons/navigation-icons.jsx'
import { HOME_VIEW } from '../utils/constants.js'
import NavigationKey from './navigation-key.jsx'

const NavigationKeysLegend = () => {
    const { currentView, filter } = useCommandPaletteContext()

    const verticalOnly = currentView !== HOME_VIEW || Boolean(filter.length)
    const showBackspace = currentView !== HOME_VIEW

    return (
        <div data-test={'headerbar-navigation-keys-legend'}>
            <NavigationKey
                label={i18n.t('to navigate')}
                icon={
                    verticalOnly ? (
                        <VerticalNavigationIcon />
                    ) : (
                        <MultiDirectionNavigationIcon />
                    )
                }
            />
            <NavigationKey
                label={i18n.t('to select')}
                icon={<SelectKeyIcon />}
            />
            <NavigationKey label={i18n.t('to close')} icon={<CloseKeyIcon />} />
            {showBackspace && (
                <NavigationKey
                    label={i18n.t('to go back one level')}
                    icon={<BackNavigationIcon />}
                />
            )}
            <style jsx>{`
                div {
                    padding: ${spacers.dp8} ${spacers.dp12};
                    background: ${colors.grey050};
                    border-block-start: 1px solid ${colors.grey300};
                    display: flex;
                    gap: ${spacers.dp24};
                }
                @media screen and (max-width: 480px) {
                    div {
                        display: none;
                    }
                }
            `}</style>
        </div>
    )
}

export default NavigationKeysLegend
